const EMPTY_ARRAY_LENGTH = 0;
export const isEmptyArray = (arr: unknown[]): boolean => Array.isArray(arr) && arr.length === EMPTY_ARRAY_LENGTH;
