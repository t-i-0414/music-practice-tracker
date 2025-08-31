import { CommonError } from './common.error';

import { type UnknownErrorCode } from '@/utils/error-code';

export class UnknownError extends CommonError<UnknownErrorCode> {
  public constructor(errorCode: UnknownErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}
export const isUnknownError = (error: unknown): error is UnknownError => error instanceof UnknownError;
