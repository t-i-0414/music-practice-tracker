import { ERROR_CODE_RECORDS, type ErrorCode, type ErrorMessage } from '@/utils/errors/error-code';

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
    return `${this.name} [${this.errorCode}](${this.timestamp}): ${this.errorMessage} ${this.detail}`;
  }
}
