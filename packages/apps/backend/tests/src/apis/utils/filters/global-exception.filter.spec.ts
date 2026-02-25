import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

import { ApiError } from '@/apis/utils/api.error';
import { GlobalExceptionFilter } from '@/apis/utils/filters/global-exception.filter';
import { DomainError } from '@/domain/utils/domain.error';
import { FirebaseError } from '@/firebase-auth/utils/firebase.error';
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/client';
import { UnknownError } from '@/utils/errors/unknown.error';

jest.mock<typeof import('dd-trace')>('dd-trace', () => {
  const setTag = jest.fn().mockReturnThis();
  const span = { setTag };
  const active = jest.fn().mockReturnValue(span);
  const scope = { active };
  const increment = jest.fn();

  return {
    __esModule: true,
    default: {
      scope: () => scope,
      dogstatsd: { increment },
    },
  } as never;
});

const ddTraceMock = require('dd-trace').default;
const mockScope = ddTraceMock.scope();
const mockActive = jest.mocked(mockScope.active);
const mockSpan = mockActive() as { setTag: jest.Mock };
const mockSetTag = mockSpan.setTag;
const mockIncrement = jest.mocked(ddTraceMock.dogstatsd.increment);

const BASE_URL = 'https://developer.music-practice-tracker.com/errors';

describe('unit GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let mockLogger: {
    setContext: jest.Mock;
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    fatal: jest.Mock;
  };
  let mockCls: { getId: jest.Mock; get: jest.Mock };

  beforeEach(() => {
    mockSetTag.mockClear();
    mockActive.mockClear().mockReturnValue(mockSpan);
    mockIncrement.mockClear();

    mockLogger = {
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    };

    mockCls = {
      getId: jest.fn().mockReturnValue('test-correlation-id'),
      get: jest.fn().mockReturnValue('test-user-id'),
    };

    filter = new GlobalExceptionFilter(mockLogger as unknown as PinoLogger, mockCls as unknown as ClsService);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      method: 'GET',
      url: '/test',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse as Response),
        getRequest: jest.fn().mockReturnValue(mockRequest as Request),
        getNext: jest.fn(),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ArgumentsHost;
  });

  describe('catch', () => {
    it('should handle HttpException correctly', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.header).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/AP0400`,
        title: 'Bad request',
        status: HttpStatus.BAD_REQUEST,
        errorCode: 'AP0400',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle HttpException with non-standard status code', () => {
      const exception = new HttpException('Test error', 499);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(499);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/AP9999`,
        title: 'Unknown application error.',
        status: 499,
        errorCode: 'AP9999',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle ApiError correctly', () => {
      const exception = new ApiError('AP0401', 'Token required');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/AP0401`,
        title: 'Unauthorized',
        status: HttpStatus.UNAUTHORIZED,
        errorCode: 'AP0401',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle ApiError with non-standard code as 500', () => {
      const exception = new ApiError('AP9999', 'Unknown api error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/AP9999`,
        title: 'Unknown application error.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'AP9999',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle DomainError correctly', () => {
      const exception = new DomainError('DO9999', 'Test domain error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/DO9999`,
        title: 'Unknown domain error.',
        status: HttpStatus.BAD_REQUEST,
        errorCode: 'DO9999',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle RepositoryError correctly', () => {
      const exception = new PrismaClientKnownRequestError('Test repository error', {
        code: 'P2000',
        clientVersion: '1.0.0',
      });

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/RE0001`,
        title: 'Column value too long for database field.',
        status: HttpStatus.BAD_REQUEST,
        errorCode: 'RE0001',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle P2025 (record not found) error correctly', () => {
      const exception = new PrismaClientKnownRequestError('Record to delete does not exist.', {
        code: 'P2025',
        clientVersion: '5.0.0',
        meta: { cause: 'Record to delete does not exist.' },
      });

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/RE0002`,
        title: 'Record not found in database.',
        status: HttpStatus.NOT_FOUND,
        errorCode: 'RE0002',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with SDK initialization failure (FB0003)', () => {
      const exception = new FirebaseError('FB0003', 'SDK initialization failure');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0003`,
        title: 'Failed to initialize Firebase Admin SDK.',
        status: HttpStatus.CONFLICT,
        errorCode: 'FB0003',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with token expired error (FB0004)', () => {
      const exception = new FirebaseError('FB0004', 'Token expired');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0004`,
        title: 'Firebase token expired.',
        status: HttpStatus.CONFLICT,
        errorCode: 'FB0004',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with token revoked error (FB0005)', () => {
      const exception = new FirebaseError('FB0005', 'Token revoked');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0005`,
        title: 'Firebase token revoked.',
        status: HttpStatus.NOT_FOUND,
        errorCode: 'FB0005',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with invalid ID token error (FB0006)', () => {
      const exception = new FirebaseError('FB0006', 'Invalid ID token');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0006`,
        title: 'Firebase invalid token.',
        status: HttpStatus.UNAUTHORIZED,
        errorCode: 'FB0006',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with user not found error (FB0007)', () => {
      const exception = new FirebaseError('FB0007', 'User not found');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0007`,
        title: 'Firebase user not found.',
        status: HttpStatus.UNAUTHORIZED,
        errorCode: 'FB0007',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with insufficient permissions error (FB0008)', () => {
      const exception = new FirebaseError('FB0008', 'Insufficient permissions');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0008`,
        title: 'Failed to delete Firebase user.',
        status: HttpStatus.FORBIDDEN,
        errorCode: 'FB0008',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with invalid service account JSON (FB0002) as internal server error', () => {
      const exception = new FirebaseError('FB0002', 'Invalid service account JSON');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0002`,
        title: 'Invalid FIREBASE_SERVICE_ACCOUNT JSON.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'FB0002',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with bulk deletion error (FB0009)', () => {
      const exception = new FirebaseError('FB0009', 'Bulk delete failed');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0009`,
        title: 'Failed to delete Firebase users in bulk.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'FB0009',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with unknown error (FB9999)', () => {
      const exception = new FirebaseError('FB9999', 'Unknown Firebase error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB9999`,
        title: 'Unknown Firebase error.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'FB9999',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle FirebaseError with credential config error (FB0001) as internal server error', () => {
      const exception = new FirebaseError('FB0001', 'Credential not configured');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/FB0001`,
        title: 'Firebase Admin credential not configured.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'FB0001',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle UnknownError correctly', () => {
      const exception = new UnknownError('UN9999', 'Test unknown error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/UN9999`,
        title: 'Unknown error.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'UN9999',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle unknown exception with default error code', () => {
      const exception = new Error('Unknown error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/UN9999`,
        title: 'Unknown error.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'UN9999',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should handle HttpException with invalid status code', () => {
      const exception = new HttpException('Test error', 999);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(999);
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: `${BASE_URL}/AP9999`,
        title: 'Unknown application error.',
        status: 999,
        errorCode: 'AP9999',
        correlationId: 'test-correlation-id',
        instance: '/test',
      });
    });

    it('should set Content-Type to application/problem+json', () => {
      const exception = new DomainError('DO9999', 'Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.header).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    });

    it('should include correlationId and instance in every response', () => {
      mockCls.getId.mockReturnValue('custom-corr-id');
      (mockRequest as { url: string }).url = '/api/v1/users/me';

      const exception = new ApiError('AP0400', 'Bad request');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'custom-corr-id',
          instance: '/api/v1/users/me',
        }),
      );
    });
  });

  describe('logging', () => {
    it('should log DomainError with warn level (severity MEDIUM)', () => {
      const exception = new DomainError('DO9999', 'Test domain error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          errorCode: 'DO9999',
          severity: 'MEDIUM',
          category: 'BUSINESS_RULE',
          method: 'GET',
          url: '/test',
        }),
        'Business error',
      );
    });

    it('should log RepositoryError with error level (severity HIGH)', () => {
      const exception = new PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0',
      });

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          severity: 'HIGH',
          category: 'INFRASTRUCTURE',
          method: 'GET',
          url: '/test',
        }),
        'Infrastructure error',
      );
    });

    it('should log UnknownError with fatal level (severity CRITICAL)', () => {
      const exception = new UnknownError('UN9999', 'Test unknown error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.fatal).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          errorCode: 'UN9999',
          severity: 'CRITICAL',
          category: 'UNKNOWN',
          method: 'GET',
          url: '/test',
        }),
        'Critical error',
      );
    });

    it('should log HttpException with warn level', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: 'AP0400',
          message: 'Test error',
        }),
        'HTTP exception',
      );
    });

    it('should log unhandled exception with error level and stack trace', () => {
      const exception = new Error('Unknown error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Unknown error',
          stack: expect.stringContaining('Error: Unknown error'),
        }),
        'Unhandled exception',
      );
    });

    it('should log ApiError with warn level (severity MEDIUM)', () => {
      const exception = new ApiError('AP0400', 'Bad request');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          errorCode: 'AP0400',
          severity: 'MEDIUM',
          category: 'VALIDATION',
        }),
        'Business error',
      );
    });

    it('should log FirebaseError with warn level (severity MEDIUM)', () => {
      const exception = new FirebaseError('FB0001', 'Firebase error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          errorCode: 'FB0001',
          severity: 'MEDIUM',
          category: 'AUTHENTICATION',
        }),
        'Business error',
      );
    });

    it('should fallback to console.error when logError throws', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockCls.get.mockImplementation(() => {
        throw new Error('CLS get failure');
      });
      const exception = new DomainError('DO9999', 'Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(consoleSpy).toHaveBeenCalledWith('GlobalExceptionFilter: logError failed', expect.any(Error), exception);

      consoleSpy.mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should include correlation ID and userId from ClsService in all log entries', () => {
      mockCls.getId.mockReturnValue('custom-correlation-id');
      mockCls.get.mockReturnValue('custom-user-id');
      const exception = new DomainError('DO9999', 'Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'custom-correlation-id',
          userId: 'custom-user-id',
        }),
        'Business error',
      );
    });
  });

  describe('datadog integration', () => {
    it('should tag active span with error metadata for CommonError', () => {
      const exception = new DomainError('DO9999', 'Test domain error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockSetTag).toHaveBeenCalledWith('error', true);
      expect(mockSetTag).toHaveBeenCalledWith('error.type', 'DomainError');
      expect(mockSetTag).toHaveBeenCalledWith('error.code', 'DO9999');
      expect(mockSetTag).toHaveBeenCalledWith('http.status_code', HttpStatus.BAD_REQUEST);
      expect(mockSetTag).toHaveBeenCalledWith('error.severity', 'MEDIUM');
      expect(mockSetTag).toHaveBeenCalledWith('error.category', 'BUSINESS_RULE');
      expect(mockSetTag).toHaveBeenCalledWith('error.operational', true);
    });

    it('should include stack trace for non-operational errors', () => {
      const exception = new UnknownError('UN9999', 'Critical failure');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockSetTag).toHaveBeenCalledWith('error.operational', false);
      expect(mockSetTag).toHaveBeenCalledWith('error.message', 'Critical failure');
      expect(mockSetTag).toHaveBeenCalledWith('error.stack', expect.stringContaining('UnknownError'));
    });

    it('should not include stack trace for operational errors', () => {
      const exception = new DomainError('DO9999', 'Expected error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockSetTag).not.toHaveBeenCalledWith('error.message', expect.anything());
      expect(mockSetTag).not.toHaveBeenCalledWith('error.stack', expect.anything());
    });

    it('should tag span with error info for plain Error exceptions', () => {
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockSetTag).toHaveBeenCalledWith('error', true);
      expect(mockSetTag).toHaveBeenCalledWith('error.type', 'Error');
      expect(mockSetTag).toHaveBeenCalledWith('error.message', 'Unexpected error');
      expect(mockSetTag).toHaveBeenCalledWith('error.stack', expect.stringContaining('Error: Unexpected error'));
    });

    it('should increment dogstatsd counter with tags for CommonError', () => {
      const exception = new DomainError('DO9999', 'Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockIncrement).toHaveBeenCalledWith('app.error.count', undefined, [
        'error_code:DO9999',
        'severity:MEDIUM',
        'category:BUSINESS_RULE',
        'operational:true',
      ]);
    });

    it('should increment dogstatsd counter with minimal tags for non-CommonError', () => {
      const exception = new Error('Unknown error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockIncrement).toHaveBeenCalledWith('app.error.count', undefined, ['error_code:UN9999']);
    });

    it('should skip span tagging but still increment metrics when no active span exists', () => {
      mockActive.mockReturnValue(null);
      const exception = new DomainError('DO9999', 'Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockSetTag).not.toHaveBeenCalled();
      expect(mockIncrement).toHaveBeenCalledWith('app.error.count', undefined, [
        'error_code:DO9999',
        'severity:MEDIUM',
        'category:BUSINESS_RULE',
        'operational:true',
      ]);
    });

    it('should tag non-Error exception as UnknownError without message or stack', () => {
      const exception = 'string error';

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockSetTag).toHaveBeenCalledWith('error', true);
      expect(mockSetTag).toHaveBeenCalledWith('error.type', 'UnknownError');
      expect(mockSetTag).not.toHaveBeenCalledWith('error.message', expect.anything());
      expect(mockSetTag).not.toHaveBeenCalledWith('error.stack', expect.anything());
      expect(mockIncrement).toHaveBeenCalledWith('app.error.count', undefined, ['error_code:UN9999']);
    });

    it('should fallback to console.warn when Datadog reporting fails', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const datadogError = new Error('Datadog unavailable');
      mockActive.mockImplementation(() => {
        throw datadogError;
      });
      const exception = new DomainError('DO9999', 'Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(consoleSpy).toHaveBeenCalledWith('GlobalExceptionFilter: reportToDatadog failed', datadogError);

      consoleSpy.mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: `${BASE_URL}/DO9999`,
          title: 'Unknown domain error.',
          status: HttpStatus.BAD_REQUEST,
          errorCode: 'DO9999',
        }),
      );
    });
  });
});
