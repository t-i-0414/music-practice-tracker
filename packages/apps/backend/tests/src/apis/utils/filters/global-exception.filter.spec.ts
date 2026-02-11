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
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'AP0400',
      });
    });

    it('should handle HttpException with non-standard status code', () => {
      const exception = new HttpException('Test error', 499);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(499);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 499,
        errorCode: 'AP9999',
      });
    });

    it('should handle ApiError correctly', () => {
      const exception = new ApiError('AP0401', 'Token required');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: 'AP0401',
      });
    });

    it('should handle ApiError with non-standard code as 500', () => {
      const exception = new ApiError('AP9999', 'Unknown api error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'AP9999',
      });
    });

    it('should handle DomainError correctly', () => {
      const exception = new DomainError('DO9999', 'Test domain error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'DO9999',
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
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'RE0001',
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
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: 'RE0002',
      });
    });

    it('should handle FirebaseError with email already exists error (FB0003)', () => {
      const exception = new FirebaseError('FB0003', 'Email already exists');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        errorCode: 'FB0003',
      });
    });

    it('should handle FirebaseError with UID already exists error (FB0004)', () => {
      const exception = new FirebaseError('FB0004', 'UID already exists');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        errorCode: 'FB0004',
      });
    });

    it('should handle FirebaseError with user not found error (FB0005)', () => {
      const exception = new FirebaseError('FB0005', 'User not found');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: 'FB0005',
      });
    });

    it('should handle FirebaseError with invalid ID token error (FB0006)', () => {
      const exception = new FirebaseError('FB0006', 'Invalid ID token');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: 'FB0006',
      });
    });

    it('should handle FirebaseError with token expired error (FB0007)', () => {
      const exception = new FirebaseError('FB0007', 'Token expired');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: 'FB0007',
      });
    });

    it('should handle FirebaseError with insufficient permissions error (FB0008)', () => {
      const exception = new FirebaseError('FB0008', 'Insufficient permissions');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.FORBIDDEN,
        errorCode: 'FB0008',
      });
    });

    it('should handle FirebaseError with unknown error (FB9999)', () => {
      const exception = new FirebaseError('FB9999', 'Unknown Firebase error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'FB9999',
      });
    });

    it('should handle FirebaseError with unmapped error code as unauthorized', () => {
      const exception = new FirebaseError('FB0001', 'Some other Firebase error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: 'FB0001',
      });
    });

    it('should handle UnknownError correctly', () => {
      const exception = new UnknownError('UN9999', 'Test unknown error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'UN9999',
      });
    });

    it('should handle unknown exception with default error code', () => {
      const exception = new Error('Unknown error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'UN9999',
      });
    });

    it('should handle HttpException with invalid status code', () => {
      const exception = new HttpException('Test error', 999);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(999);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 999,
        errorCode: 'AP9999',
      });
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

      mockCls.getId.mockImplementation(() => {
        throw new Error('CLS failure');
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
});
