import { CommonError } from '@/utils/errors/common.error';
import {
  firebaseErrorPrefix,
  isErrorCode,
  type ErrorCode,
  type PreservedFirebaseErrorCode,
} from '@/utils/errors/error-code';

export class FirebaseError extends CommonError<FirebaseErrorCode> {
  public constructor(errorCode: FirebaseErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}

export const isFirebaseError = (error: unknown): error is FirebaseError => error instanceof FirebaseError;

export type FirebaseErrorCode = Extract<ErrorCode, PreservedFirebaseErrorCode>;

export const isFirebaseErrorCode = (value: unknown): value is FirebaseErrorCode =>
  typeof value === 'string' && isErrorCode(value) && value.startsWith(firebaseErrorPrefix);