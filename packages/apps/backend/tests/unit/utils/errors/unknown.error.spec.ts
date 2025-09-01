import { CommonError } from '@/utils/errors/common.error';
import { UnknownError, isUnknownError, isUnknownErrorCode } from '@/utils/errors/unknown.error';

describe('class UnknownError', () => {
  describe('constructor', () => {
    it('should create UnknownError with correct properties', () => {
      const error = new UnknownError('UN9999', 'Test unknown error');

      expect(error.errorCode).toBe('UN9999');
      expect(error.message).toBe('Test unknown error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CommonError);
      expect(error).toBeInstanceOf(UnknownError);
    });

    it('should create UnknownError with cause', () => {
      const originalError = new Error('Original error');
      const error = new UnknownError('UN9999', 'Test unknown error', originalError);

      expect(error.errorCode).toBe('UN9999');
      expect(error.message).toBe('Test unknown error');
      expect(error.cause).toBe(originalError);
    });

    it('should inherit from CommonError', () => {
      const error = new UnknownError('UN9999', 'Test error');

      expect(error).toBeInstanceOf(CommonError);
      expect(error.name).toBe('UnknownError');
    });
  });

  describe('error properties', () => {
    it('should have proper error code format', () => {
      const error = new UnknownError('UN9999', 'Test error');

      expect(error.errorCode).toMatch(/^UN\d{4}$/u);
    });

    it('should maintain timestamp', () => {
      const error = new UnknownError('UN9999', 'Test error');

      expect(error.timestamp).toBeDefined();
      expect(typeof error.timestamp).toBe('string');
      expect(new Date(error.timestamp)).toBeInstanceOf(Date);
    });
  });
});

describe('function isUnknownError', () => {
  it('should return true for UnknownError instance', () => {
    const error = new UnknownError('UN9999', 'Test error');

    expect(isUnknownError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Regular error');

    expect(isUnknownError(error)).toBe(false);
  });

  it('should return false for other CommonError subclasses', () => {
    class MockError extends CommonError {
      public constructor(errorCode: any, detail: string) {
        super(errorCode, detail);
      }
    }

    const error = new MockError('AP0400', 'Test error') as unknown;

    expect(isUnknownError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isUnknownError(null)).toBe(false);
    expect(isUnknownError(undefined)).toBe(false);
    expect(isUnknownError('string')).toBe(false);
    expect(isUnknownError({})).toBe(false);
    expect(isUnknownError(123)).toBe(false);
  });

  it('should return false for error-like objects', () => {
    const errorLike = {
      message: 'Error message',
      errorCode: 'UN9999',
      stack: 'Error stack',
    };

    expect(isUnknownError(errorLike)).toBe(false);
  });
});

describe('function isUnknownErrorCode', () => {
  const mockIsErrorCode = jest.fn();
  const mockUnknownErrorPrefix = 'UN';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.doMock<typeof import('@/utils/errors/error-code')>('@/utils/errors/error-code', () => {
      const actual = jest.requireActual('@/utils/errors/error-code');
      return {
        ...actual,
        isErrorCode: mockIsErrorCode,
        unknownErrorPrefix: mockUnknownErrorPrefix,
      };
    });
  });

  it('should return true for valid unknown error codes', () => {
    mockIsErrorCode.mockReturnValue(true);

    expect(isUnknownErrorCode('UN9999')).toBe(true);
    expect(isUnknownErrorCode('UN9999')).toBe(true);
    expect(mockIsErrorCode).toHaveBeenCalledWith('UN9999');
  });

  it('should return false for non-UN error codes', () => {
    mockIsErrorCode.mockReturnValue(true);

    expect(isUnknownErrorCode('RE0001')).toBe(false);
    expect(isUnknownErrorCode('AP0001')).toBe(false);
    expect(isUnknownErrorCode('DO0001')).toBe(false);
  });

  it('should return false for invalid error codes', () => {
    mockIsErrorCode.mockReturnValue(false);

    expect(isUnknownErrorCode('UN9999')).toBe(false);
    expect(isUnknownErrorCode('INVALID')).toBe(false);
    expect(isUnknownErrorCode('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isUnknownErrorCode(null)).toBe(false);
    expect(isUnknownErrorCode(undefined)).toBe(false);
    expect(isUnknownErrorCode(123)).toBe(false);
    expect(isUnknownErrorCode({})).toBe(false);
  });

  describe('with actual implementation', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should work with real error code validation', async () => {
      expect.assertions(1);

      const { isUnknownErrorCode: realIsUnknownErrorCode } = await import('@/utils/errors/unknown.error');

      expect(typeof realIsUnknownErrorCode('UN9999')).toBe('boolean');
    });
  });
});

describe('usage patterns of UnknownError', () => {
  it('should identify UnknownError instances correctly', () => {
    const unknownError = new UnknownError('UN9999', 'Test error');
    const regularError = new Error('Regular error');

    expect(isUnknownError(unknownError)).toBe(true);
    expect(isUnknownError(regularError)).toBe(false);
  });

  it('should provide access to error code for UnknownError instances', () => {
    const unknownError = new UnknownError('UN9999', 'Test error');

    expect(unknownError.errorCode).toBe('UN9999');
  });

  it('should serialize properly to JSON', () => {
    const error = new UnknownError('UN9999', 'Test error detail');

    const json = error.toJSON();

    expect(json).toHaveProperty('name', 'UnknownError');
    expect(json).toHaveProperty('errorCode', 'UN9999');
    expect(json).toHaveProperty('detail', 'Test error detail');
    expect(json).toHaveProperty('timestamp');
  });

  it('should format string representation correctly', () => {
    const error = new UnknownError('UN9999', 'Test error detail');

    const str = error.toString();

    expect(str).toContain('UnknownError');
    expect(str).toContain('UN9999');
    expect(str).toContain('Test error detail');
    expect(str).toMatch(/UnknownError \[UN9999\]\(.+\): .+ Test error detail/u);
  });
});
