import { type CommonError } from './common-error/common-error';

export type Result<T, E extends CommonError> = { success: true; data: T } | { success: false; error: E };

export const Ok = <T, E extends CommonError>(data: T): Result<T, E> => ({ success: true, data });
export const Err = <T, E extends CommonError>(error: E): Result<T, E> => ({ success: false, error });
