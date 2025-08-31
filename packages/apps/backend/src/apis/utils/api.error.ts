import { CommonError } from '@/utils/common.error';
import { type ApiErrorCode } from '@/utils/error-code';

export class ApiError extends CommonError<ApiErrorCode> {
  public constructor(errorCode: ApiErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}
export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
