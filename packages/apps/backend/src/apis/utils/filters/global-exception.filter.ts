import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { isApiError } from '../api.error';
import { ErrorResponse } from '../response';

import { isDomainError } from '@/domain/utils/domain.error';
import { buildRepositoryError, canConvertToRepositoryError } from '@/repository/repository.error';
import { isUnknownError } from '@/utils/common.error';
import { ERROR_CODE_RECORDS } from '@/utils/error-code';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.buildErrorResponse(exception);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown): ErrorResponse {
    if (canConvertToRepositoryError(exception)) {
      const repositoryError = buildRepositoryError(exception);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: repositoryError.errorCode,
        errorMessage: repositoryError.errorMessage,
        detail: repositoryError.detail,
        timestamp: new Date().toISOString(),
      };
    }

    if (isDomainError(exception)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: exception.errorCode,
        errorMessage: exception.errorMessage,
        detail: exception.detail,
        timestamp: exception.timestamp,
      };
    }

    if (isApiError(exception)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: exception.errorCode,
        errorMessage: exception.errorMessage,
        detail: exception.detail,
        timestamp: exception.timestamp,
      };
    }

    if (isUnknownError(exception)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: exception.errorCode,
        errorMessage: exception.errorMessage,
        detail: exception.detail,
        timestamp: exception.timestamp,
      };
    }

    const errorCode = 'UN9999';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode,
      errorMessage: ERROR_CODE_RECORDS[errorCode],
      detail: exception instanceof Error ? exception.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    };
  }
}
