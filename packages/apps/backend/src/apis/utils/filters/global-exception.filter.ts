import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { ErrorResponse } from '../response';

import { buildRepositoryError, canConvertToRepositoryError } from '@/repository/repository.error';
import { ERROR_CODE_RECORDS } from '@/utils/common-error/error-code';

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

    const errorCode = 'UN9999';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode,
      errorMessage: ERROR_CODE_RECORDS[errorCode],
      detail: 'Internal server error',
      timestamp: new Date().toISOString(),
    };
  }
}
