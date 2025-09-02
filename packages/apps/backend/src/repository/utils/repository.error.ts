import { isPrismaError, isPrismaErrorCode, PRISMA_ERROR_CODE_MAP, type PrismaError } from './prisma.error';

import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@/generated/prisma/runtime/library';
import { CommonError } from '@/utils/errors/common.error';
import { type PreservedRepositoryErrorCode, type ErrorCode } from '@/utils/errors/error-code';

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

    return new RepositoryError(errorCode, detail, error);
  }

  if (error instanceof PrismaClientValidationError) {
    return new RepositoryError(REPOSITORY_ERROR_CODE_RECORD.VALIDATION, error.message, error);
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    return new RepositoryError(REPOSITORY_ERROR_CODE_RECORD.UNKNOWN_REQUEST, error.message, error);
  }

  if (error instanceof PrismaClientRustPanicError) {
    return new RepositoryError(REPOSITORY_ERROR_CODE_RECORD.RUST_PANIC, error.message, error);
  }

  if (error instanceof PrismaClientInitializationError) {
    const originalErrorCode = error.errorCode;

    if (originalErrorCode === undefined || !isPrismaErrorCode(originalErrorCode)) {
      const errorCode = REPOSITORY_ERROR_CODE_RECORD.UNKNOWN;
      return new RepositoryError(errorCode, error.message, error);
    }

    return new RepositoryError(PRISMA_ERROR_CODE_MAP[originalErrorCode], error.message, error);
  }

  // NOTE: Unreachable
  return new RepositoryError(REPOSITORY_ERROR_CODE_RECORD.UNKNOWN, 'An unknown Prisma error occurred', error);
};
