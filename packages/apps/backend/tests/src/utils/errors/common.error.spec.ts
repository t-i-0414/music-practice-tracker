import { setupDateMock, restoreDateMocks } from '@/tests/helpers/date-mock.helper';
import { CommonError, type CommonErrorOptions } from '@/utils/errors/common.error';
import { ErrorCategory } from '@/utils/errors/error-category';
import { ERROR_CODE_RECORDS, type ErrorCode } from '@/utils/errors/error-code';
import { ErrorSeverity } from '@/utils/errors/error-severity';

class TestCommonError extends CommonError {
  public constructor(errorCode: ErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      isOperational: true,
    });
  }
}

describe('unit CommonError', () => {
  const mockDate = '2023-01-01T00:00:00.000Z';
  let toISOStringSpy: jest.SpyInstance;
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    const { toISOStringSpy: toISO, dateNowSpy: dateNow } = setupDateMock(mockDate);
    toISOStringSpy = toISO;
    dateNowSpy = dateNow;
  });

  afterEach(() => {
    restoreDateMocks(toISOStringSpy, dateNowSpy);
  });

  describe('constructor', () => {
    it('should create CommonError with correct properties', () => {
      const error = new TestCommonError('AP0400', 'Test detail');

      expect(error.errorCode).toBe('AP0400');
      expect(error.errorMessage).toBe('Bad request');
      expect(error.detail).toBe('Test detail');
      expect(error.timestamp).toBe(mockDate);
      expect(error.message).toBe('Test detail');
      expect(error.name).toBe('TestCommonError');
    });

    it('should create CommonError with cause', () => {
      const originalError = new Error('Original error');
      const error = new TestCommonError('AP0400', 'Test detail', originalError);

      expect(error.cause).toBe(originalError);
    });

    it('should extend Error', () => {
      const error = new TestCommonError('AP0400', 'Test detail');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CommonError);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const error = new TestCommonError('AP0400', 'Test detail');

      const json = error.toJSON();

      expect(json).toStrictEqual({
        name: 'TestCommonError',
        errorCode: 'AP0400',
        errorMessage: 'Bad request',
        detail: 'Test detail',
        timestamp: mockDate,
      });
    });

    it('should include all required fields', () => {
      const error = new TestCommonError('AP0401', 'API error detail');

      const json = error.toJSON();

      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('errorCode');
      expect(json).toHaveProperty('errorMessage');
      expect(json).toHaveProperty('detail');
      expect(json).toHaveProperty('timestamp');
    });
  });

  describe('toString', () => {
    it('should return correct string representation', () => {
      const error = new TestCommonError('AP0400', 'Test detail');

      const str = error.toString();

      expect(str).toBe(`TestCommonError [AP0400](${mockDate}): Bad request Test detail`);
    });

    it('should format different error codes correctly', () => {
      const error = new TestCommonError('RE0001', 'Repository error detail');

      const str = error.toString();

      expect(str).toBe(
        `TestCommonError [RE0001](${mockDate}): Column value too long for database field. Repository error detail`,
      );
    });
  });

  describe('error properties', () => {
    it('should set timestamp on creation', () => {
      restoreDateMocks(toISOStringSpy, dateNowSpy);
      const beforeCreate = Date.now();

      const error = new TestCommonError('AP0400', 'Test detail');
      const afterCreate = Date.now();

      const errorTime = new Date(error.timestamp).getTime();

      expect(errorTime).toBeGreaterThanOrEqual(beforeCreate);
      expect(errorTime).toBeLessThanOrEqual(afterCreate);
    });

    it('should use error code to get error message', () => {
      const error = new TestCommonError('AP0401', 'API error detail');

      expect(error.errorMessage).toBe('Unauthorized');
      expect(error.errorMessage).toBe(ERROR_CODE_RECORDS.AP0401);
    });
  });

  describe('observability properties', () => {
    it('should have default severity, category, and isOperational', () => {
      const error = new TestCommonError('AP0400', 'Test detail');

      expect(error.severity).toBe('MEDIUM');
      expect(error.category).toBe('UNKNOWN');
      expect(error.isOperational).toBe(true);
    });

    it('should allow overriding options via constructor', () => {
      class OverridableError extends CommonError {
        public constructor(errorCode: ErrorCode, detail: string, options: CommonErrorOptions) {
          super(errorCode, detail, undefined, options);
        }
      }

      const error = new OverridableError('AP0400', 'Test', {
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.INFRASTRUCTURE,
        isOperational: false,
      });

      expect(error.severity).toBe('CRITICAL');
      expect(error.category).toBe('INFRASTRUCTURE');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('toLogEntry', () => {
    it('should return correct log entry shape', () => {
      const error = new TestCommonError('AP0400', 'Test detail');
      const logEntry = error.toLogEntry();

      expect(logEntry).toStrictEqual({
        errorName: 'TestCommonError',
        errorCode: 'AP0400',
        errorMessage: 'Bad request',
        detail: 'Test detail',
        severity: 'MEDIUM',
        category: 'UNKNOWN',
        isOperational: true,
        timestamp: mockDate,
      });
    });

    it('should include cause message when cause is an Error', () => {
      const cause = new Error('Original failure');
      const error = new TestCommonError('AP0400', 'Test detail', cause);
      const logEntry = error.toLogEntry();

      expect(logEntry.cause).toBe('Original failure');
    });

    it('should serialize string cause directly', () => {
      const error = new TestCommonError('AP0400', 'Test detail', 'string cause');
      const logEntry = error.toLogEntry();

      expect(logEntry.cause).toBe('string cause');
    });

    it('should serialize object cause as JSON', () => {
      const cause = { code: 123, reason: 'test' };
      const error = new TestCommonError('AP0400', 'Test detail', cause);
      const logEntry = error.toLogEntry();

      expect(logEntry.cause).toBe('{"code":123,"reason":"test"}');
    });

    it('should handle circular cause with fallback message', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      const error = new TestCommonError('AP0400', 'Test detail', circular);
      const logEntry = error.toLogEntry();

      expect(logEntry.cause).toBe('[non-serializable cause]');
    });

    it('should not include cause when cause is undefined', () => {
      const error = new TestCommonError('AP0400', 'Test detail');
      const logEntry = error.toLogEntry();

      expect(logEntry).not.toHaveProperty('cause');
    });

    it('should include stack trace for non-operational errors', () => {
      class NonOperationalError extends CommonError {
        public constructor(errorCode: ErrorCode, detail: string) {
          super(errorCode, detail, undefined, {
            severity: ErrorSeverity.CRITICAL,
            category: ErrorCategory.UNKNOWN,
            isOperational: false,
          });
        }
      }

      const error = new NonOperationalError('AP0400', 'Critical failure');
      const logEntry = error.toLogEntry();

      expect(logEntry.stack).toBeDefined();
      expect(logEntry.stack).toContain('NonOperationalError');
    });

    it('should not include stack trace for operational errors', () => {
      const error = new TestCommonError('AP0400', 'Normal error');
      const logEntry = error.toLogEntry();

      expect(logEntry).not.toHaveProperty('stack');
    });
  });

  describe('inheritance', () => {
    class CustomError extends CommonError {
      public customProperty: string;

      public constructor(errorCode: ErrorCode, detail: string, customProperty: string) {
        super(errorCode, detail, undefined, {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.UNKNOWN,
          isOperational: true,
        });
        this.customProperty = customProperty;
      }
    }

    it('should work with inheritance', () => {
      const error = new CustomError('AP0400', 'Test detail', 'custom value');

      expect(error.errorCode).toBe('AP0400');
      expect(error.customProperty).toBe('custom value');
      expect(error.name).toBe('CustomError');
      expect(error).toBeInstanceOf(CommonError);
      expect(error).toBeInstanceOf(CustomError);
    });

    it('should include inherited properties in toJSON', () => {
      const error = new CustomError('AP0400', 'Test detail', 'custom value');

      const json = error.toJSON();

      expect(json.name).toBe('CustomError');
      expect(json.errorCode).toBe('AP0400');
    });
  });
});
