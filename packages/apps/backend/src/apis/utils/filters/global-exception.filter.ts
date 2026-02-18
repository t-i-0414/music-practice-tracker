import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import tracer from 'dd-trace';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

import {
  ApiError,
  buildErrorTypeUrl,
  ErrorResponseDto,
  HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE,
  isApiError,
} from '../api.error';

import { DomainError, isDomainError } from '@/domain/utils/domain.error';
import { FirebaseError, isFirebaseError } from '@/firebase-auth/utils/firebase.error';
import {
  buildRepositoryError,
  canConvertToRepositoryError,
  RepositoryError,
} from '@/repository/utils/repository.error';
import { CommonError } from '@/utils/errors/common.error';
import { apiErrorPrefix, ERROR_CODE_RECORDS, type ErrorCode, isErrorCode } from '@/utils/errors/error-code';
import { ErrorSeverity } from '@/utils/errors/error-severity';
import { isUnknownError, UnknownError } from '@/utils/errors/unknown.error';

const httpErrorCodePrefix = `${apiErrorPrefix}0`;

type BuildResult = { errorResponse: ErrorResponseDto; resolvedException: unknown };

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public constructor(
    private readonly logger: PinoLogger,
    private readonly cls: ClsService,
  ) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { errorResponse, resolvedException } = this.buildErrorResponse(exception);
    errorResponse.correlationId = this.cls.getId();
    errorResponse.instance = request.url;

    try {
      this.logError(resolvedException, errorResponse, request);
    } catch (loggingError: unknown) {
      // eslint-disable-next-line no-console -- last-resort fallback when structured logging itself fails
      console.error('GlobalExceptionFilter: logError failed', loggingError, resolvedException);
    }
    try {
      this.reportToDatadog(resolvedException, errorResponse);
    } catch (datadogError: unknown) {
      // eslint-disable-next-line no-console -- last-resort fallback when Datadog reporting fails
      console.warn('GlobalExceptionFilter: reportToDatadog failed', datadogError);
    }
    response.status(errorResponse.status).header('Content-Type', 'application/problem+json').json(errorResponse);
  }

  private logError(exception: unknown, errorResponse: ErrorResponseDto, request: Request): void {
    const correlationId = this.cls.getId();
    const userId = this.cls.get('userId');
    const baseLogEntry = {
      correlationId,
      userId,
      statusCode: errorResponse.status,
      errorCode: errorResponse.errorCode,
      method: request.method,
      url: request.url,
    };

    if (exception instanceof CommonError) {
      const logEntry = { ...baseLogEntry, ...exception.toLogEntry() };
      this.logBySeverity(exception.severity, logEntry);
    } else if (exception instanceof HttpException) {
      this.logger.warn({ ...baseLogEntry, message: exception.message }, 'HTTP exception');
    } else {
      const errorDetail =
        exception instanceof Error
          ? { error: exception.message, stack: exception.stack }
          : { error: String(exception) };
      this.logger.error({ ...baseLogEntry, ...errorDetail }, 'Unhandled exception');
    }
  }

  private logBySeverity(severity: ErrorSeverity, logEntry: Record<string, unknown>): void {
    switch (severity) {
      case ErrorSeverity.LOW:
        this.logger.info(logEntry, 'Operational error');
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.warn(logEntry, 'Business error');
        break;
      case ErrorSeverity.HIGH:
        this.logger.error(logEntry, 'Infrastructure error');
        break;
      case ErrorSeverity.CRITICAL:
        this.logger.fatal(logEntry, 'Critical error');
        break;
      default: {
        const _exhaustive: never = severity;
        this.logger.error(logEntry, `Unknown severity: ${String(_exhaustive)}`);
        break;
      }
    }
  }

  private reportToDatadog(exception: unknown, errorResponse: ErrorResponseDto): void {
    const span = tracer.scope().active();

    if (span !== null) {
      span.setTag('error', true);
      span.setTag('error.type', exception instanceof Error ? exception.name : 'UnknownError');
      span.setTag('error.code', errorResponse.errorCode);
      span.setTag('http.status_code', errorResponse.status);

      if (exception instanceof CommonError) {
        span.setTag('error.severity', exception.severity);
        span.setTag('error.category', exception.category);
        span.setTag('error.operational', exception.isOperational);

        if (!exception.isOperational) {
          span.setTag('error.message', exception.detail);
          if (exception.stack !== undefined) {
            span.setTag('error.stack', exception.stack);
          }
        }
      } else if (exception instanceof Error) {
        span.setTag('error.message', exception.message);
        if (exception.stack !== undefined) {
          span.setTag('error.stack', exception.stack);
        }
      }
    }

    const metricTags = [`error_code:${errorResponse.errorCode}`];
    if (exception instanceof CommonError) {
      metricTags.push(`severity:${exception.severity}`);
      metricTags.push(`category:${exception.category}`);
      metricTags.push(`operational:${String(exception.isOperational)}`);
    }
    tracer.dogstatsd.increment('app.error.count', undefined, metricTags);
  }

  private buildErrorResponse(exception: unknown): BuildResult {
    if (exception instanceof HttpException) {
      return { errorResponse: this.handleHttpException(exception), resolvedException: exception };
    }

    if (isApiError(exception)) {
      return { errorResponse: this.handleApiError(exception), resolvedException: exception };
    }

    if (isDomainError(exception)) {
      return { errorResponse: this.handleDomainError(exception), resolvedException: exception };
    }

    if (isFirebaseError(exception)) {
      return { errorResponse: this.handleFirebaseError(exception), resolvedException: exception };
    }

    if (canConvertToRepositoryError(exception)) {
      const repositoryError = buildRepositoryError(exception);
      return { errorResponse: this.handleRepositoryError(repositoryError), resolvedException: repositoryError };
    }

    if (isUnknownError(exception)) {
      return { errorResponse: this.handleUnknownError(exception), resolvedException: exception };
    }

    const errorCode = 'UN9999' as const;

    return {
      errorResponse: this.toRfc7807(HttpStatus.INTERNAL_SERVER_ERROR, errorCode),
      resolvedException: exception,
    };
  }

  private toRfc7807(status: number, errorCode: ErrorCode): ErrorResponseDto {
    return {
      type: buildErrorTypeUrl(errorCode),
      title: ERROR_CODE_RECORDS[errorCode],
      status,
      errorCode,
    };
  }

  private handleHttpException(exception: HttpException): ErrorResponseDto {
    const status = exception.getStatus();
    const _errorCode = `${httpErrorCodePrefix}${status}`;
    const errorCode = isErrorCode(_errorCode) ? _errorCode : 'AP9999';

    return this.toRfc7807(status, errorCode);
  }

  private handleApiError(exception: ApiError): ErrorResponseDto {
    const statusMatch = /^AP0(?<status>\d{3})$/u.exec(exception.errorCode);
    const status =
      statusMatch?.groups?.status !== undefined
        ? parseInt(statusMatch.groups.status, 10)
        : HttpStatus.INTERNAL_SERVER_ERROR;

    return this.toRfc7807(status, exception.errorCode);
  }

  private handleDomainError(exception: DomainError): ErrorResponseDto {
    return this.toRfc7807(HttpStatus.BAD_REQUEST, exception.errorCode);
  }

  private handleFirebaseError(exception: FirebaseError): ErrorResponseDto {
    const { errorCode } = exception;
    let status = HttpStatus.UNAUTHORIZED;

    switch (errorCode) {
      case 'FB0001':
      case 'FB0002':
      case 'FB0009':
      case 'FB9999':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
      case 'FB0003':
      case 'FB0004':
        status = HttpStatus.CONFLICT;
        break;
      case 'FB0005':
        status = HttpStatus.NOT_FOUND;
        break;
      case 'FB0006':
      case 'FB0007':
        status = HttpStatus.UNAUTHORIZED;
        break;
      case 'FB0008':
        status = HttpStatus.FORBIDDEN;
        break;
      default: {
        const _exhaustive: never = errorCode;
        this.logger.warn(`Unmapped Firebase error code: ${String(_exhaustive)}, defaulting to 401`);
        break;
      }
    }

    return this.toRfc7807(status, exception.errorCode);
  }

  private handleRepositoryError(exception: RepositoryError): ErrorResponseDto {
    const status = HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE[exception.errorCode];
    return this.toRfc7807(status, exception.errorCode);
  }

  private handleUnknownError(exception: UnknownError): ErrorResponseDto {
    return this.toRfc7807(HttpStatus.INTERNAL_SERVER_ERROR, exception.errorCode);
  }
}
