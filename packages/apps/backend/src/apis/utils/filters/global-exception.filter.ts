import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

import {
  ApiError,
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
import { apiErrorPrefix, isErrorCode } from '@/utils/errors/error-code';
import { ErrorSeverity } from '@/utils/errors/error-severity';
import { isUnknownError, UnknownError } from '@/utils/errors/unknown.error';

const httpErrorCodePrefix = `${apiErrorPrefix}0`;

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
    try {
      this.logError(resolvedException, errorResponse, request);
    } catch (loggingError: unknown) {
      // eslint-disable-next-line no-console -- last-resort fallback when structured logging itself fails
      console.error('GlobalExceptionFilter: logError failed', loggingError);
    }
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private logError(exception: unknown, errorResponse: ErrorResponseDto, request: Request): void {
    const correlationId = this.cls.getId();
    const userId = this.cls.get('userId');
    const baseLogEntry = {
      correlationId,
      userId,
      statusCode: errorResponse.statusCode,
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
      this.logger.error(
        { ...baseLogEntry, error: exception instanceof Error ? exception.message : String(exception) },
        'Unhandled exception',
      );
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

  private buildErrorResponse(exception: unknown): {
    errorResponse: ErrorResponseDto;
    resolvedException: unknown;
  } {
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

    const errorCode = 'UN9999';

    return {
      errorResponse: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode,
      },
      resolvedException: exception,
    };
  }

  private handleHttpException(exception: HttpException): ErrorResponseDto {
    const statusCode = exception.getStatus();
    const _errorCode = `${httpErrorCodePrefix}${statusCode}`;
    const errorCode = isErrorCode(_errorCode) ? _errorCode : 'AP9999';

    return {
      statusCode,
      errorCode,
    };
  }

  private handleApiError(exception: ApiError): ErrorResponseDto {
    const statusMatch = /^AP0(?<status>\d{3})$/u.exec(exception.errorCode);
    const statusCode =
      statusMatch?.groups?.status !== undefined && statusMatch.groups.status !== ''
        ? parseInt(statusMatch.groups.status, 10)
        : HttpStatus.INTERNAL_SERVER_ERROR;

    return {
      statusCode,
      errorCode: exception.errorCode,
    };
  }

  private handleDomainError(exception: DomainError): ErrorResponseDto {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: exception.errorCode,
    };
  }

  private handleFirebaseError(exception: FirebaseError): ErrorResponseDto {
    const { errorCode } = exception;
    let statusCode = HttpStatus.UNAUTHORIZED;

    if (errorCode === 'FB0003' || errorCode === 'FB0004') {
      statusCode = HttpStatus.CONFLICT;
    } else if (errorCode === 'FB0005') {
      statusCode = HttpStatus.NOT_FOUND;
    } else if (errorCode === 'FB0006' || errorCode === 'FB0007') {
      statusCode = HttpStatus.UNAUTHORIZED;
    } else if (errorCode === 'FB0008') {
      statusCode = HttpStatus.FORBIDDEN;
    } else if (errorCode === 'FB9999') {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return {
      statusCode,
      errorCode: exception.errorCode,
    };
  }

  private handleRepositoryError(exception: RepositoryError): ErrorResponseDto {
    const statusCode = HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE[exception.errorCode];
    return {
      statusCode,
      errorCode: exception.errorCode,
    };
  }

  private handleUnknownError(exception: UnknownError): ErrorResponseDto {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: exception.errorCode,
    };
  }
}
