import { ApplicationError, DomainError, RepositoryError, UnknownError, type CommonError } from './common-error';
import {
  isApplicationErrorCode,
  isDomainErrorCode,
  isRepositoryErrorCode,
  isUnknownErrorCode,
  type ErrorCode,
} from './error-code';

export class ErrorFactory {
  public static create(errorCode: ErrorCode, detail: string, cause?: unknown): CommonError {
    if (isApplicationErrorCode(errorCode)) {
      return new ApplicationError(errorCode, detail, cause);
    }

    if (isDomainErrorCode(errorCode)) {
      return new DomainError(errorCode, detail, cause);
    }

    if (isRepositoryErrorCode(errorCode)) {
      return new RepositoryError(errorCode, detail, cause);
    }

    if (isUnknownErrorCode(errorCode)) {
      return new UnknownError(errorCode, detail, cause);
    }

    return new UnknownError('UN9999', `Invalid error code. detail: ${detail}`, cause);
  }
}
