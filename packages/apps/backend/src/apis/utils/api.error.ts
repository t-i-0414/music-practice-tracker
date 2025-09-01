import { CommonError } from '@/utils/errors/common.error';
import { apiErrorPrefix, type ErrorCode, isErrorCode, type PreservedApiErrorCode } from '@/utils/errors/error-code';

export class ApiError extends CommonError<ApiErrorCode> {
  public constructor(errorCode: ApiErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}
export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export type ApiErrorCode = Extract<ErrorCode, PreservedApiErrorCode>;
export const isApiErrorCode = (value: string): value is ApiErrorCode =>
  isErrorCode(value) && value.startsWith(apiErrorPrefix);
