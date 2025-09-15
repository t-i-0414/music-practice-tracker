import { type ValidationError } from 'class-validator';

export const NON_ERROR_LENGTH = 0;

export const transformValidationErrorIntoDetail = (errors: ValidationError[]): string =>
  errors
    .flatMap((e) => Object.values(e.constraints ?? {}))
    .filter((m): m is string => typeof m === 'string' && m !== '')
    .join('; ');
