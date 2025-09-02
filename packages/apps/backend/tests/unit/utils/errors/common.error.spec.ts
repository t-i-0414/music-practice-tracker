import { CommonError } from '@/utils/errors/common.error';
import { ERROR_CODE_RECORDS, type ErrorCode } from '@/utils/errors/error-code';

class TestCommonError extends CommonError {
  public constructor(errorCode: ErrorCode, detail: string, cause?: unknown) {
    super(errorCode, detail, cause);
  }
}

describe('unit CommonError', () => {
  const mockDate = '2023-01-01T00:00:00.000Z';
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
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
      const beforeCreate = Date.now();
      dateNowSpy.mockRestore();

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

  describe('inheritance', () => {
    class CustomError extends CommonError {
      public customProperty: string;

      public constructor(errorCode: any, detail: string, customProperty: string) {
        super(errorCode, detail);
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
