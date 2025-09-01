import { CommonError } from '@/utils/errors/common.error';
import { type DomainErrorCode } from '@/utils/errors/error-code';

export class DomainError extends CommonError<DomainErrorCode> {
  public constructor(errorCode: DomainErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}

export const isDomainError = (error: unknown): error is DomainError => error instanceof DomainError;
