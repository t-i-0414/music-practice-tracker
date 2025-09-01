import { CommonError } from './common.error';

import {
  type ErrorCode,
  isErrorCode,
  type PreservedUnknownErrorCode,
  unknownErrorPrefix,
} from '@/utils/errors/error-code';

export class UnknownError extends CommonError<UnknownErrorCode> {
  public constructor(errorCode: UnknownErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}
export const isUnknownError = (error: unknown): error is UnknownError => error instanceof UnknownError;

export type UnknownErrorCode = Extract<ErrorCode, PreservedUnknownErrorCode>;
export const isUnknownErrorCode = (value: string): value is UnknownErrorCode =>
  isErrorCode(value) && value.startsWith(unknownErrorPrefix);
