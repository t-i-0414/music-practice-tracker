import { CommonError } from '@/utils/errors/common.error';
import {
  domainErrorPrefix,
  isErrorCode,
  type PreservedDomainErrorCode,
  type ErrorCode,
} from '@/utils/errors/error-code';

export class DomainError extends CommonError<DomainErrorCode> {
  public constructor(errorCode: DomainErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}

export const isDomainError = (error: unknown): error is DomainError => error instanceof DomainError;

export type DomainErrorCode = Extract<ErrorCode, PreservedDomainErrorCode>;
export const isDomainErrorCode = (value: string): value is DomainErrorCode =>
  isErrorCode(value) && value.startsWith(domainErrorPrefix);
