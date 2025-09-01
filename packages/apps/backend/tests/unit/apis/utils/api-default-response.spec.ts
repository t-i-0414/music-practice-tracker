import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ApiStandardResponses } from '@/apis/utils/api-default-response';
import { ErrorResponseDto } from '@/apis/utils/api.error';

// Mock the dependencies
jest.mock<typeof import('@nestjs/common')>('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    applyDecorators: jest.fn(),
  };
});

jest.mock<typeof import('@nestjs/swagger')>('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger');
  return {
    ...actual,
    ApiResponse: jest.fn(),
  };
});

jest.mock<typeof import('@/apis/utils/api.error')>('@/apis/utils/api.error', () => {
  const actual = jest.requireActual('@/apis/utils/api.error');
  return {
    ...actual,
    ErrorResponseDto: class MockErrorResponseDto {},
  };
});

describe('decorator ApiStandardResponses', () => {
  const mockApplyDecorators = jest.mocked(applyDecorators);
  const mockApiResponse = jest.mocked(ApiResponse);

  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyDecorators.mockReturnValue(jest.fn());
    mockApiResponse.mockReturnValue(jest.fn());
  });

  it('should call applyDecorators with correct ApiResponse configuration', () => {
    ApiStandardResponses();

    expect(mockApiResponse).toHaveBeenCalledWith({
      status: 'default',
      description: 'Error Response',
      type: ErrorResponseDto,
    });

    expect(mockApplyDecorators).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should return the result of applyDecorators', () => {
    const expectedResult = jest.fn();
    mockApplyDecorators.mockReturnValue(expectedResult);

    const result = ApiStandardResponses();

    expect(result).toBe(expectedResult);
  });

  it('should be a function that can be used as a decorator', () => {
    expect(typeof ApiStandardResponses).toBe('function');
  });

  it('should configure error response with default status', () => {
    ApiStandardResponses();

    expect(mockApiResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'default',
      }),
    );
  });

  it('should configure error response with correct description', () => {
    ApiStandardResponses();

    expect(mockApiResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Error Response',
      }),
    );
  });

  it('should configure error response with ErrorResponseDto type', () => {
    ApiStandardResponses();

    expect(mockApiResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ErrorResponseDto,
      }),
    );
  });
});
