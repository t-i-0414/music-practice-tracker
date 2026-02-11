import { FirebaseError, isFirebaseError, isFirebaseErrorCode } from '@/firebase-auth/utils/firebase.error';
import { CommonError } from '@/utils/errors/common.error';
import { ErrorCategory } from '@/utils/errors/error-category';
import { ErrorSeverity } from '@/utils/errors/error-severity';

describe('unit FirebaseError', () => {
  describe('class FirebaseError', () => {
    it('should create FirebaseError instance with correct properties', () => {
      const error = new FirebaseError('FB0001', 'Test firebase error', new Error('cause'));

      expect(error).toBeInstanceOf(FirebaseError);
      expect(error).toBeInstanceOf(CommonError);
      expect(error).toBeInstanceOf(Error);
      expect(error.errorCode).toBe('FB0001');
      expect(error.detail).toBe('Test firebase error');
      expect(error.cause).toStrictEqual(new Error('cause'));
    });

    it('should create FirebaseError instance without cause', () => {
      const error = new FirebaseError('FB0002', 'Firebase error without cause');

      expect(error).toBeInstanceOf(FirebaseError);
      expect(error.errorCode).toBe('FB0002');
      expect(error.detail).toBe('Firebase error without cause');
      expect(error.cause).toBeUndefined();
    });

    it('should have correct error name', () => {
      const error = new FirebaseError('FB0003', 'Test error');

      expect(error.name).toBe('FirebaseError');
    });

    it('should have correct stack trace', () => {
      const error = new FirebaseError('FB0004', 'Stack trace test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('FirebaseError');
    });

    it.each(['FB0001', 'FB0002', 'FB0003', 'FB0004', 'FB0005', 'FB0006', 'FB0007', 'FB0008', 'FB9999'] as const)(
      'should work with Firebase error code %s',
      (code) => {
        const error = new FirebaseError(code, `Error for ${code}`);

        expect(error.errorCode).toBe(code);
        expect(error.detail).toBe(`Error for ${code}`);
      },
    );
  });

  describe('observability properties', () => {
    it('should have severity MEDIUM, category AUTHENTICATION, isOperational true', () => {
      const error = new FirebaseError('FB0001', 'Firebase error');

      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('function isFirebaseError', () => {
    it('should return true for FirebaseError instances', () => {
      const error = new FirebaseError('FB0001', 'Test error');

      expect(isFirebaseError(error)).toBe(true);
    });

    it('should return false for non-FirebaseError errors', () => {
      expect(isFirebaseError(new Error('regular error'))).toBe(false);
      expect(isFirebaseError(new TypeError('type error'))).toBe(false);
    });

    it('should return false for other CommonError subclasses', () => {
      class MockError extends CommonError {
        public constructor(errorCode: any, detail: string) {
          super(errorCode, detail);
        }
      }

      const error = new MockError('UN9999', 'Test error');

      expect(isFirebaseError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isFirebaseError(null)).toBe(false);
      expect(isFirebaseError(undefined)).toBe(false);
      expect(isFirebaseError('string')).toBe(false);
      expect(isFirebaseError(123)).toBe(false);
      expect(isFirebaseError({})).toBe(false);
      expect(isFirebaseError([])).toBe(false);
    });

    it('should be a type guard', () => {
      expect.assertions(3);

      const value: unknown = new FirebaseError('FB0001', 'Test');

      expect(isFirebaseError(value)).toBe(true);

      // TypeScript should know this is a FirebaseError
      const typedError = value as FirebaseError;

      expect(typedError.errorCode).toBe('FB0001');
      expect(typedError.detail).toBe('Test');
    });
  });

  describe('function isFirebaseErrorCode', () => {
    it.each(['FB0001', 'FB0002', 'FB0003', 'FB0004', 'FB0005', 'FB0006', 'FB0007', 'FB0008', 'FB9999'])(
      'should return true for Firebase error code %s',
      (code) => {
        expect(isFirebaseErrorCode(code)).toBe(true);
      },
    );

    it('should return false for non-Firebase error codes', () => {
      expect(isFirebaseErrorCode('AP0400')).toBe(false);
      expect(isFirebaseErrorCode('DO0001')).toBe(false);
      expect(isFirebaseErrorCode('RE0001')).toBe(false);
      expect(isFirebaseErrorCode('UN9999')).toBe(false);
    });

    it('should return false for invalid formats', () => {
      expect(isFirebaseErrorCode('FB')).toBe(false);
      expect(isFirebaseErrorCode('FB00')).toBe(false);
      expect(isFirebaseErrorCode('FB000')).toBe(false);
      expect(isFirebaseErrorCode('FB00000')).toBe(false);
      expect(isFirebaseErrorCode('fb0001')).toBe(false); // lowercase
      expect(isFirebaseErrorCode('FB_001')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isFirebaseErrorCode(null)).toBe(false);
      expect(isFirebaseErrorCode(undefined)).toBe(false);
      expect(isFirebaseErrorCode(123)).toBe(false);
      expect(isFirebaseErrorCode({})).toBe(false);
      expect(isFirebaseErrorCode([])).toBe(false);
      expect(isFirebaseErrorCode(true)).toBe(false);
    });

    it('should return false for non-existent Firebase codes', () => {
      expect(isFirebaseErrorCode('FB0010')).toBe(false);
      expect(isFirebaseErrorCode('FB0100')).toBe(false);
      expect(isFirebaseErrorCode('FB1000')).toBe(false);
    });

    it('should be a type guard', () => {
      expect.assertions(2);

      const value: unknown = 'FB0001';

      expect(isFirebaseErrorCode(value)).toBe(true);

      // TypeScript should know this is a FirebaseErrorCode
      const code = value as
        | 'FB0001'
        | 'FB0002'
        | 'FB0003'
        | 'FB0004'
        | 'FB0005'
        | 'FB0006'
        | 'FB0007'
        | 'FB0008'
        | 'FB9999';

      expect(code).toBe('FB0001');
    });
  });

  describe('error inheritance', () => {
    it('should inherit from CommonError', () => {
      const error = new FirebaseError('FB0001', 'Test');

      expect(error).toBeInstanceOf(CommonError);
    });

    it('should inherit from Error', () => {
      const error = new FirebaseError('FB0001', 'Test');

      expect(error).toBeInstanceOf(Error);
    });

    it('should work with try-catch blocks', () => {
      expect.assertions(3);

      let errorCaught: unknown;

      try {
        throw new FirebaseError('FB0001', 'Caught error');
      } catch (error) {
        errorCaught = error;
      }

      expect(isFirebaseError(errorCaught)).toBe(true);

      const typedError = errorCaught as FirebaseError;

      expect(typedError.errorCode).toBe('FB0001');
      expect(typedError.detail).toBe('Caught error');
    });

    it('should work with Promise rejection', async () => {
      expect.assertions(3);

      let errorCaught: unknown;

      try {
        await Promise.reject(new FirebaseError('FB0002', 'Rejected error'));
      } catch (error) {
        errorCaught = error;
      }

      expect(isFirebaseError(errorCaught)).toBe(true);

      const typedError = errorCaught as FirebaseError;

      expect(typedError.errorCode).toBe('FB0002');
      expect(typedError.detail).toBe('Rejected error');
    });
  });

  describe('error message formatting', () => {
    it('should have detail as the message', () => {
      const error = new FirebaseError('FB0001', 'Firebase Admin credential not configured.');

      expect(error.message).toBe('Firebase Admin credential not configured.');
      expect(error.detail).toBe('Firebase Admin credential not configured.');
    });

    it('should format toString output correctly', () => {
      const error = new FirebaseError('FB0004', 'Firebase token expired.');

      const str = error.toString();

      expect(str).toContain('FirebaseError');
      expect(str).toContain('FB0004');
      expect(str).toContain('Firebase token expired.');
    });
  });

  describe('edge cases', () => {
    it('should handle empty detail string', () => {
      const error = new FirebaseError('FB0001', '');

      expect(error.errorCode).toBe('FB0001');
      expect(error.detail).toBe('');
      expect(error.message).toBe('');
    });

    it('should handle very long detail string', () => {
      const longDetail = 'A'.repeat(1000);
      const error = new FirebaseError('FB0001', longDetail);

      expect(error.detail).toBe(longDetail);
      expect(error.message).toContain(longDetail);
    });

    it('should handle special characters in detail', () => {
      const detail = 'Error with special chars: \n\t\r"\'`${}[]()';
      const error = new FirebaseError('FB0001', detail);

      expect(error.detail).toBe(detail);
    });

    it('should handle undefined cause', () => {
      const error = new FirebaseError('FB0001', 'Test', undefined);

      expect(error.cause).toBeUndefined();
    });

    it('should handle null cause', () => {
      const error = new FirebaseError('FB0001', 'Test', null);

      expect(error.cause).toBeNull();
    });

    it('should handle object cause', () => {
      const cause = { reason: 'test', code: 123 };
      const error = new FirebaseError('FB0001', 'Test', cause);

      expect(error.cause).toStrictEqual(cause);
    });
  });
});
