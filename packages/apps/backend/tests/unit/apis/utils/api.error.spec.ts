import { HttpStatus } from '@nestjs/common';

import {
  ApiError,
  isApiError,
  isApiErrorCode,
  ErrorResponseDto,
  HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE,
} from '@/apis/utils/api.error';

describe('class ApiError', () => {
  describe('constructor', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('AP0400', 'Test error');

      expect(error.errorCode).toBe('AP0400');
      expect(error.message).toBe('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
    });

    it('should create ApiError with cause', () => {
      const originalError = new Error('Original error');
      const error = new ApiError('AP0400', 'Test error', originalError);

      expect(error.errorCode).toBe('AP0400');
      expect(error.message).toBe('Test error');
      expect(error.cause).toBe(originalError);
    });
  });

  describe('function isApiError', () => {
    it('should return true for ApiError instance', () => {
      const error = new ApiError('AP0400', 'Test error');

      expect(isApiError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');

      expect(isApiError(error)).toBe(false);
    });

    it.each([
      [null, 'null'],
      [undefined, 'undefined'],
      ['string', 'string'],
      [{}, 'object'],
    ])('should return false for %s', (value, _type) => {
      expect(isApiError(value)).toBe(false);
    });
  });

  describe('function isApiErrorCode', () => {
    it.each(['AP0400', 'AP9999'])('should return true for valid API error code %s', (code) => {
      expect(isApiErrorCode(code)).toBe(true);
    });

    it.each([
      ['RE0001', 'repository error code'],
      ['DO0001', 'domain error code'],
      ['UN0001', 'unknown error code'],
      ['INVALID', 'invalid format'],
      ['', 'empty string'],
    ])('should return false for %s (%s)', (code, _reason) => {
      expect(isApiErrorCode(code)).toBe(false);
    });
  });
});

describe('constant HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE', () => {
  describe('data validation errors', () => {
    it.each([
      ['RE0001', HttpStatus.BAD_REQUEST],
      ['RE0002', HttpStatus.NOT_FOUND],
      ['RE0003', HttpStatus.CONFLICT],
    ])('%s should map to %s', (code, status) => {
      expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE[code]).toBe(status);
    });
  });

  describe('query errors', () => {
    it.each([
      ['RE0101', HttpStatus.BAD_REQUEST],
      ['RE0103', HttpStatus.INTERNAL_SERVER_ERROR],
      ['RE0108', HttpStatus.NOT_FOUND],
    ])('%s should map to %s', (code, status) => {
      expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE[code]).toBe(status);
    });
  });

  describe('connection & system errors', () => {
    it.each([
      ['RE0201', HttpStatus.NOT_FOUND],
      ['RE0203', HttpStatus.REQUEST_TIMEOUT],
      ['RE0209', HttpStatus.SERVICE_UNAVAILABLE],
    ])('%s should map to %s', (code, status) => {
      expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE[code]).toBe(status);
    });
  });

  describe('migration errors', () => {
    it.each([
      ['RE0301', HttpStatus.INTERNAL_SERVER_ERROR],
      ['RE0302', HttpStatus.CONFLICT],
      ['RE0304', HttpStatus.FORBIDDEN],
    ])('%s should map to %s', (code, status) => {
      expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE[code]).toBe(status);
    });
  });

  it('should map generic error correctly', () => {
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE9999).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('class ErrorResponseDto', () => {
  it('should be defined', () => {
    expect(ErrorResponseDto).toBeDefined();
  });

  it('should have correct structure', () => {
    const dto = new ErrorResponseDto();

    expect(dto).toHaveProperty('statusCode');
    expect(dto).toHaveProperty('errorCode');
  });
});
