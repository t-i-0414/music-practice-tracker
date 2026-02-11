import { ErrorCategory } from '@/utils/errors/error-category';
import { ERROR_CODE_RECORDS, type ErrorCode, type ErrorMessage } from '@/utils/errors/error-code';
import { ErrorSeverity } from '@/utils/errors/error-severity';

export type CommonErrorBody = {
  errorCode: ErrorCode;
  errorMessage: ErrorMessage;
  detail: string;
  timestamp: string;
};

export type CommonErrorOptions = {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  isOperational?: boolean;
};

export type CommonErrorLogEntry = {
  errorName: string;
  errorCode: string;
  errorMessage: string;
  detail: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  isOperational: boolean;
  timestamp: string;
  cause?: string;
  stack?: string;
};

export abstract class CommonError<TErrorCode extends ErrorCode = ErrorCode> extends Error {
  public readonly errorCode: TErrorCode;
  public readonly errorMessage: CommonErrorBody['errorMessage'];
  public readonly detail: CommonErrorBody['detail'];
  public readonly timestamp: CommonErrorBody['timestamp'];
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly isOperational: boolean;

  protected constructor(errorCode: TErrorCode, detail: string, cause?: unknown, options?: CommonErrorOptions) {
    super(detail, { cause });
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.errorMessage = ERROR_CODE_RECORDS[errorCode];
    this.detail = detail;
    this.timestamp = new Date().toISOString();
    this.severity = options?.severity ?? ErrorSeverity.MEDIUM;
    this.category = options?.category ?? ErrorCategory.UNKNOWN;
    this.isOperational = options?.isOperational ?? true;
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

  public toLogEntry(): CommonErrorLogEntry {
    return {
      errorName: this.name,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      detail: this.detail,
      severity: this.severity,
      category: this.category,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      ...(this.cause instanceof Error
        ? { cause: this.cause.message }
        : this.cause !== undefined
          ? { cause: this.serializeCause(this.cause) }
          : {}),
      ...(!this.isOperational && this.stack !== undefined ? { stack: this.stack } : {}),
    };
  }

  private serializeCause(cause: unknown): string {
    if (typeof cause === 'string') return cause;
    try {
      return JSON.stringify(cause);
    } catch {
      return '[non-serializable cause]';
    }
  }
}
