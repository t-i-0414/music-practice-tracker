import { CommonError } from '@/utils/errors/common.error';
import { ErrorCategory } from '@/utils/errors/error-category';
import {
  domainErrorPrefix,
  isErrorCode,
  type PreservedDomainErrorCode,
  type ErrorCode,
} from '@/utils/errors/error-code';
import { ErrorSeverity } from '@/utils/errors/error-severity';

export class DomainError extends CommonError<DomainErrorCode> {
  public constructor(errorCode: DomainErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.BUSINESS_RULE,
      isOperational: true,
    });
  }
}

export const isDomainError = (error: unknown): error is DomainError => error instanceof DomainError;

export type DomainErrorCode = Extract<ErrorCode, PreservedDomainErrorCode>;
export const isDomainErrorCode = (value: unknown): value is DomainErrorCode =>
  typeof value === 'string' && isErrorCode(value) && value.startsWith(domainErrorPrefix);
