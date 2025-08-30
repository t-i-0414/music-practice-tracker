import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

import { type PrismaError, PRISMA_ERROR_CODE_MAP, isPrismaError, isPrismaErrorCode } from './error';

import { type RepositoryError } from '@/utils/common-error/common-error';
import { ErrorFactory } from '@/utils/common-error/factory';

const REPOSITORY_ERROR_CODE_RECORD = {
  VALIDATION: 'RE0008',
  UNKNOWN_REQUEST: 'RE0208',
  RUST_PANIC: 'RE0207',
  UNKNOWN: 'RE9999',
} as const;

export class RepositoryErrorHandler {
  public static handle(error: unknown): RepositoryError {
    if (isPrismaError(error)) {
      return this.handlePrismaError(error);
    }

    if (error instanceof Error) {
      return ErrorFactory.create(REPOSITORY_ERROR_CODE_RECORD.UNKNOWN, error.message, error);
    }

    return ErrorFactory.create(REPOSITORY_ERROR_CODE_RECORD.UNKNOWN, 'An unknown repository error occurred', error);
  }

  private static handlePrismaError(error: PrismaError): RepositoryError {
    if (error instanceof PrismaClientKnownRequestError) {
      return this.handleKnownRequestError(error);
    }

    if (error instanceof PrismaClientValidationError) {
      return ErrorFactory.create(REPOSITORY_ERROR_CODE_RECORD.VALIDATION, error.message, error);
    }

    if (error instanceof PrismaClientUnknownRequestError) {
      return ErrorFactory.create(REPOSITORY_ERROR_CODE_RECORD.UNKNOWN_REQUEST, error.message, error);
    }

    if (error instanceof PrismaClientRustPanicError) {
      return ErrorFactory.create(REPOSITORY_ERROR_CODE_RECORD.RUST_PANIC, error.message, error);
    }

    if (error instanceof PrismaClientInitializationError) {
      return this.handleInitializationError(error);
    }

    // NOTE: Unreachable
    return ErrorFactory.create(REPOSITORY_ERROR_CODE_RECORD.UNKNOWN, 'An unknown Prisma error occurred', error);
  }

  private static handleKnownRequestError(error: PrismaClientKnownRequestError): RepositoryError {
    const errorCode = isPrismaErrorCode(error.code)
      ? PRISMA_ERROR_CODE_MAP[error.code]
      : REPOSITORY_ERROR_CODE_RECORD.UNKNOWN;
    const detail = error.meta ? `${error.message} ${JSON.stringify(error.meta)}` : error.message;

    return ErrorFactory.create(errorCode, detail, error);
  }

  private static handleInitializationError(error: PrismaClientInitializationError): RepositoryError {
    const originalErrorCode = error.errorCode;

    if (originalErrorCode === undefined || !isPrismaErrorCode(originalErrorCode)) {
      const errorCode = REPOSITORY_ERROR_CODE_RECORD.UNKNOWN;
      return ErrorFactory.create(errorCode, error.message, error);
    }

    return ErrorFactory.create(PRISMA_ERROR_CODE_MAP[originalErrorCode], error.message, error);
  }
}
