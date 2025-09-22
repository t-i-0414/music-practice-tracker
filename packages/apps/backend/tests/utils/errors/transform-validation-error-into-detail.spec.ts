import { type ValidationError } from 'class-validator';

import { transformValidationErrorIntoDetail } from '@/utils/errors/transform-validation-error-into-detail';

describe('unit transformValidationErrorIntoDetail', () => {
  it('joins all constraint messages using a semicolon separator', () => {
    expect.assertions(1);

    const errors: ValidationError[] = [
      {
        property: 'name',
        constraints: {
          isString: 'name must be a string',
          isNotEmpty: 'name should not be empty',
        },
      },
      {
        property: 'email',
        constraints: {
          isEmail: 'email must be an email',
        },
      },
    ];

    const detail = transformValidationErrorIntoDetail(errors);

    expect(detail).toBe('name must be a string; name should not be empty; email must be an email');
  });

  it('filters out non-string or empty constraint values', () => {
    expect.assertions(1);

    const errors: ValidationError[] = [
      {
        property: 'age',
        constraints: {
          isNumber: 'age must be a number',
          min: '',
        },
      },
      {
        property: 'nested',
        constraints: undefined,
      },
      {
        property: 'misc',
        constraints: {
          custom: undefined as unknown as string,
        },
      },
    ];

    const detail = transformValidationErrorIntoDetail(errors);

    expect(detail).toBe('age must be a number');
  });

  it('returns an empty string when there are no constraint messages', () => {
    expect.assertions(1);

    const detail = transformValidationErrorIntoDetail([]);

    expect(detail).toBe('');
  });
});
