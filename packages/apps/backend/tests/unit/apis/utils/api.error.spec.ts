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

    it('should return false for non-error values', () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
      expect(isApiError('string')).toBe(false);
      expect(isApiError({})).toBe(false);
    });
  });

  describe('function isApiErrorCode', () => {
    it('should return true for valid API error codes', () => {
      expect(isApiErrorCode('AP0400')).toBe(true);
      expect(isApiErrorCode('AP9999')).toBe(true);
    });

    it('should return false for invalid API error codes', () => {
      expect(isApiErrorCode('RE0001')).toBe(false);
      expect(isApiErrorCode('DO0001')).toBe(false);
      expect(isApiErrorCode('UN0001')).toBe(false);
      expect(isApiErrorCode('INVALID')).toBe(false);
      expect(isApiErrorCode('')).toBe(false);
    });
  });
});

describe('constant HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE', () => {
  it('should map data validation errors correctly', () => {
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0001).toBe(HttpStatus.BAD_REQUEST);
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0002).toBe(HttpStatus.NOT_FOUND);
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0003).toBe(HttpStatus.CONFLICT);
  });

  it('should map query errors correctly', () => {
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0101).toBe(HttpStatus.BAD_REQUEST);
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0103).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0108).toBe(HttpStatus.NOT_FOUND);
  });

  it('should map connection & system errors correctly', () => {
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0201).toBe(HttpStatus.NOT_FOUND);
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0203).toBe(HttpStatus.REQUEST_TIMEOUT);
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0209).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('should map migration errors correctly', () => {
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0301).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0302).toBe(HttpStatus.CONFLICT);
    expect(HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE.RE0304).toBe(HttpStatus.FORBIDDEN);
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
