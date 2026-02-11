import { DomainError, isDomainError, isDomainErrorCode } from '@/domain/utils/domain.error';
import { CommonError } from '@/utils/errors/common.error';
import { ErrorCategory } from '@/utils/errors/error-category';
import { ErrorSeverity } from '@/utils/errors/error-severity';

describe('unit DomainError', () => {
  describe('constructor', () => {
    it('should create DomainError with correct properties', () => {
      const error = new DomainError('DO9999', 'Test domain error');

      expect(error.errorCode).toBe('DO9999');
      expect(error.message).toBe('Test domain error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CommonError);
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should create DomainError with cause', () => {
      const originalError = new Error('Original error');
      const error = new DomainError('DO9999', 'Test domain error', originalError);

      expect(error.errorCode).toBe('DO9999');
      expect(error.message).toBe('Test domain error');
      expect(error.cause).toBe(originalError);
    });

    it('should inherit from CommonError', () => {
      const error = new DomainError('DO9999', 'Test error');

      expect(error).toBeInstanceOf(CommonError);
      expect(error.name).toBe('DomainError');
    });
  });

  describe('observability properties', () => {
    it('should have severity MEDIUM, category BUSINESS_RULE, isOperational true', () => {
      const error = new DomainError('DO9999', 'Business rule violation');

      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.category).toBe(ErrorCategory.BUSINESS_RULE);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('error properties', () => {
    it('should have proper error code format', () => {
      const error = new DomainError('DO9999', 'Test error');

      expect(error.errorCode).toMatch(/^DO\d{4}$/u);
    });

    it('should maintain timestamp', () => {
      const error = new DomainError('DO9999', 'Test error');

      expect(error.timestamp).toBeDefined();
      expect(typeof error.timestamp).toBe('string');
      expect(new Date(error.timestamp)).toBeInstanceOf(Date);
    });

    it('should have detail property', () => {
      const error = new DomainError('DO9999', 'Detailed error message');

      expect(error.detail).toBe('Detailed error message');
    });
  });

  describe('common error inheritance', () => {
    it('should implement toJSON method', () => {
      const error = new DomainError('DO9999', 'Test error');

      const json = error.toJSON();

      expect(json).toHaveProperty('name', 'DomainError');
      expect(json).toHaveProperty('errorCode', 'DO9999');
      expect(json).toHaveProperty('detail', 'Test error');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('errorMessage');
    });

    it('should implement toString method', () => {
      const error = new DomainError('DO9999', 'Test error');

      const str = error.toString();

      expect(str).toContain('DomainError');
      expect(str).toContain('DO9999');
      expect(str).toContain('Test error');
      expect(str).toMatch(/DomainError \[DO9999\]\(.+\): .+ Test error/u);
    });
  });
});

describe('function isDomainError', () => {
  it('should return true for DomainError instance', () => {
    const error = new DomainError('DO9999', 'Test error');

    expect(isDomainError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Regular error');

    expect(isDomainError(error)).toBe(false);
  });

  it('should return false for other CommonError subclasses', () => {
    class MockError extends CommonError {
      public constructor(errorCode: any, detail: string) {
        super(errorCode, detail);
      }
    }

    const error = new MockError('AP0400', 'Test error');

    expect(isDomainError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isDomainError(null)).toBe(false);
    expect(isDomainError(undefined)).toBe(false);
    expect(isDomainError('string')).toBe(false);
    expect(isDomainError({})).toBe(false);
    expect(isDomainError(123)).toBe(false);
  });

  it('should return false for error-like objects', () => {
    const errorLike = {
      message: 'Error message',
      errorCode: 'DO9999',
      stack: 'Error stack',
    };

    expect(isDomainError(errorLike)).toBe(false);
  });
});

describe('function isDomainErrorCode', () => {
  it('should return true for valid domain error codes', () => {
    expect(isDomainErrorCode('DO9999')).toBe(true);
  });

  it('should return false for non-DO error codes', () => {
    expect(isDomainErrorCode('RE0001')).toBe(false);
    expect(isDomainErrorCode('RE0002')).toBe(false);
    expect(isDomainErrorCode('AP0400')).toBe(false);
    expect(isDomainErrorCode('UN9999')).toBe(false);
  });

  it('should return false for invalid error codes', () => {
    expect(isDomainErrorCode('DO0000')).toBe(false);
    expect(isDomainErrorCode('INVALID')).toBe(false);
    expect(isDomainErrorCode('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isDomainErrorCode(null)).toBe(false);
    expect(isDomainErrorCode(undefined)).toBe(false);
    expect(isDomainErrorCode(123)).toBe(false);
    expect(isDomainErrorCode({})).toBe(false);
  });
});

describe('usage patterns of DomainError', () => {
  it('should identify DomainError instances correctly', () => {
    const domainError = new DomainError('DO9999', 'Business rule violation');
    const regularError = new Error('Regular error');

    expect(isDomainError(domainError)).toBe(true);
    expect(isDomainError(regularError)).toBe(false);
  });

  it('should provide access to error code for DomainError instances', () => {
    const domainError = new DomainError('DO9999', 'Business rule violation');

    expect(domainError.errorCode).toBe('DO9999');
  });

  it('should serialize properly to JSON', () => {
    const error = new DomainError('DO9999', 'Business rule violation');

    const json = error.toJSON();

    expect(json).toHaveProperty('name', 'DomainError');
    expect(json).toHaveProperty('errorCode', 'DO9999');
    expect(json).toHaveProperty('detail', 'Business rule violation');
    expect(json).toHaveProperty('timestamp');
  });

  it('should format string representation correctly', () => {
    const error = new DomainError('DO9999', 'Business rule violation');

    const str = error.toString();

    expect(str).toContain('DomainError');
    expect(str).toContain('DO9999');
    expect(str).toContain('Business rule violation');
    expect(str).toMatch(/DomainError \[DO9999\]\(.+\): .+ Business rule violation/u);
  });

  it('should throw DomainError with correct properties', () => {
    const riskyOperation = () => {
      throw new DomainError('DO9999', 'Invalid operation');
    };

    expect(() => riskyOperation()).toThrow(DomainError);
    expect(() => riskyOperation()).toThrow('Invalid operation');
  });

  it('should be identifiable in catch blocks', () => {
    let caughtError: unknown;

    try {
      throw new DomainError('DO9999', 'Invalid operation');
    } catch (error) {
      caughtError = error;
    }

    expect(isDomainError(caughtError)).toBe(true);
    expect(caughtError).toBeInstanceOf(DomainError);

    const domainError = caughtError as DomainError;

    expect(domainError.errorCode).toBe('DO9999');
  });

  it('should support error chaining with cause', () => {
    const originalError = new Error('Database connection failed');
    const domainError = new DomainError('DO9999', 'User operation failed', originalError);

    expect(domainError.cause).toBe(originalError);
    expect(domainError.message).toBe('User operation failed');
    expect(domainError.errorCode).toBe('DO9999');
  });
});
