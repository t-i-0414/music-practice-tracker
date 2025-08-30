import {
  type ApplicationErrorCode,
  type DomainErrorCode,
  ERROR_CODE_RECORDS,
  type RepositoryErrorCode,
  type UnknownErrorCode,
  type ErrorCode,
  type ErrorMessage,
} from '@/utils/common-error/error-code';

export type CommonErrorBody = {
  errorCode: ErrorCode;
  errorMessage: ErrorMessage;
  detail: string;
  timestamp: string;
};

export abstract class CommonError<TErrorCode extends ErrorCode = ErrorCode> extends Error {
  public readonly errorCode: CommonErrorBody['errorCode'];
  public readonly errorMessage: CommonErrorBody['errorMessage'];
  public readonly detail: CommonErrorBody['detail'];
  public readonly timestamp: CommonErrorBody['timestamp'];

  protected constructor(errorCode: TErrorCode, detail: string, cause?: unknown) {
    super(detail, { cause });
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.errorMessage = ERROR_CODE_RECORDS[errorCode];
    this.detail = detail;
    this.timestamp = new Date().toISOString();
  }

  public toJSON(): CommonErrorBody & {
    name: string;
  } {
    return {
      name: this.name,
      errorCode: this.errorCode,
      errorMessage: ERROR_CODE_RECORDS[this.errorCode],
      detail: this.detail,
      timestamp: this.timestamp,
    };
  }

  public toString(): string {
    return `${this.name} [${this.errorCode}](${this.timestamp}): ${this.errorMessage}. ${this.detail}`;
  }
}

export class ApplicationError extends CommonError<ApplicationErrorCode> {
  public constructor(errorCode: ApplicationErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}
export const isApplicationError = (error: unknown): error is ApplicationError => error instanceof ApplicationError;

export class DomainError extends CommonError<DomainErrorCode> {
  public constructor(errorCode: DomainErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}
export const isDomainError = (error: unknown): error is DomainError => error instanceof DomainError;

export class RepositoryError extends CommonError<RepositoryErrorCode> {
  public constructor(errorCode: RepositoryErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}
export const isRepositoryError = (error: unknown): error is RepositoryError => error instanceof RepositoryError;

export class UnknownError extends CommonError<UnknownErrorCode> {
  public constructor(errorCode: UnknownErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}
export const isUnknownError = (error: unknown): error is UnknownError => error instanceof UnknownError;
