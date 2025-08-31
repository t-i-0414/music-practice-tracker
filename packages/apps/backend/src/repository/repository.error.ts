import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

import { isPrismaError, isPrismaErrorCode, PRISMA_ERROR_CODE_MAP, type PrismaError } from './prisma.error';

import { CommonError } from '@/utils/common-error/common-error';
import { type PreservedRepositoryErrorCode, type ErrorCode } from '@/utils/common-error/error-code';
import { ErrorFactory } from '@/utils/common-error/factory';

export type RepositoryErrorCode = Extract<ErrorCode, PreservedRepositoryErrorCode>;

export class RepositoryError extends CommonError<RepositoryErrorCode> {
  public constructor(errorCode: RepositoryErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}

export const canConvertToRepositoryError = (error: unknown): error is PrismaError => isPrismaError(error);

const REPOSITORY_ERROR_CODE_RECORD = {
  VALIDATION: 'RE0008',
  UNKNOWN_REQUEST: 'RE0208',
  RUST_PANIC: 'RE0207',
  UNKNOWN: 'RE9999',
} as const;
export const buildRepositoryError = (error: PrismaError): RepositoryError => {
  if (error instanceof PrismaClientKnownRequestError) {
    const errorCode = isPrismaErrorCode(error.code)
      ? PRISMA_ERROR_CODE_MAP[error.code]
      : REPOSITORY_ERROR_CODE_RECORD.UNKNOWN;
    const detail = error.meta ? `${error.message}: meta: ${JSON.stringify(error.meta)}` : error.message;

    return ErrorFactory.create(errorCode, detail, error);
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
    const originalErrorCode = error.errorCode;

    if (originalErrorCode === undefined || !isPrismaErrorCode(originalErrorCode)) {
      const errorCode = REPOSITORY_ERROR_CODE_RECORD.UNKNOWN;
      return ErrorFactory.create(errorCode, error.message, error);
    }

    return ErrorFactory.create(PRISMA_ERROR_CODE_MAP[originalErrorCode], error.message, error);
  }

  // NOTE: Unreachable
  return ErrorFactory.create(REPOSITORY_ERROR_CODE_RECORD.UNKNOWN, 'An unknown Prisma error occurred', error);
};
