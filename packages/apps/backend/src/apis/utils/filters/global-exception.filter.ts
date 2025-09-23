import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';

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
import { apiErrorPrefix, isErrorCode } from '@/utils/errors/error-code';
import { isUnknownError, UnknownError } from '@/utils/errors/unknown.error';

const httpErrorCodePrefix = `${apiErrorPrefix}0`;

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.buildErrorResponse(exception);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown): ErrorResponseDto {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (isApiError(exception)) {
      return this.handleApiError(exception);
    }

    if (isDomainError(exception)) {
      return this.handleDomainError(exception);
    }

    if (isFirebaseError(exception)) {
      return this.handleFirebaseError(exception);
    }

    if (canConvertToRepositoryError(exception)) {
      const repositoryError = buildRepositoryError(exception);
      return this.handleRepositoryError(repositoryError);
    }

    if (isUnknownError(exception)) {
      return this.handleUnknownError(exception);
    }

    const errorCode = 'UN9999';

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode,
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
