import { ApplicationError, DomainError, RepositoryError, UnknownError, type CommonError } from './common-error';
import {
  isApplicationErrorCode,
  isDomainErrorCode,
  isRepositoryErrorCode,
  isUnknownErrorCode,
  type ErrorCode,
} from './error-code';

export class ErrorFactory {
  public static create(errorCode: ErrorCode, detail: string): CommonError {
    if (isApplicationErrorCode(errorCode)) {
      return new ApplicationError(errorCode, detail);
    }

    if (isDomainErrorCode(errorCode)) {
      return new DomainError(errorCode, detail);
    }

    if (isRepositoryErrorCode(errorCode)) {
      return new RepositoryError(errorCode, detail);
    }

    if (isUnknownErrorCode(errorCode)) {
      return new UnknownError(errorCode, detail);
    }

    return new UnknownError('UN9999', `Invalid error code. detail: ${detail}`);
  }
}
