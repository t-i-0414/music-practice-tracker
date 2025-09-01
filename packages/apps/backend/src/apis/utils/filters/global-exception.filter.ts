import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

import { HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE } from '../api.error';

import { DomainError, isDomainError } from '@/domain/utils/domain.error';
import {
  buildRepositoryError,
  canConvertToRepositoryError,
  RepositoryError,
} from '@/repository/utils/repository.error';
import { apiErrorPrefix, ErrorCode, isErrorCode } from '@/utils/errors/error-code';
import { isUnknownError, UnknownError } from '@/utils/errors/unknown.error';

const httpErrorCodePrefix = `${apiErrorPrefix}0`;

export type ErrorResponse = {
  statusCode: HttpStatus;
  errorCode: ErrorCode;
};

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const _request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (isDomainError(exception)) {
      return this.handleDomainError(exception);
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

  private handleHttpException(exception: HttpException): ErrorResponse {
    const statusCode = exception.getStatus();
    const _errorCode = `${httpErrorCodePrefix}${statusCode}`;
    const errorCode = isErrorCode(_errorCode) ? _errorCode : 'AP9999';

    return {
      statusCode,
      errorCode,
    };
  }

  private handleDomainError(exception: DomainError): ErrorResponse {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: exception.errorCode,
    };
  }

  private handleRepositoryError(exception: RepositoryError): ErrorResponse {
    const statusCode = HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE[exception.errorCode];
    return {
      statusCode,
      errorCode: exception.errorCode,
    };
  }

  private handleUnknownError(exception: UnknownError): ErrorResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: exception.errorCode,
    };
  }
}
