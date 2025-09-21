import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiError } from '@/apis/utils/api.error';
import { GlobalExceptionFilter } from '@/apis/utils/filters/global-exception.filter';
import { DomainError } from '@/domain/utils/domain.error';
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library';
import { UnknownError } from '@/utils/errors/unknown.error';

describe('unit GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {};

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

    it('should handle DomainError correctly', () => {
      const exception = new DomainError('DO9999', 'Test domain error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'DO9999',
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

    it('should fallback to 500 when ApiError code does not encode status', () => {
      const exception = new ApiError('AP9999', 'Unknown api error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'AP9999',
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
});
