export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export const Ok = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

export const Err = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
});
