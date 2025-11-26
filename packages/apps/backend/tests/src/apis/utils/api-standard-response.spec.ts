import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ApiStandardResponses } from '@/apis/utils/api-standard-response';
import { ErrorResponseDto } from '@/apis/utils/api.error';

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

jest.mock<typeof import('../../../../src/apis/utils/api.error')>('../../../../src/apis/utils/api.error', () => {
  const actual = jest.requireActual('@/apis/utils/api.error');
  return {
    ...actual,
    ErrorResponseDto: class MockErrorResponseDto {},
  };
});

describe('unit ApiStandardResponses', () => {
  const mockApplyDecorators = jest.mocked(applyDecorators);
  const mockApiResponse = jest.mocked(ApiResponse);

  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyDecorators.mockReturnValue(jest.fn());
    mockApiResponse.mockReturnValue(jest.fn());
  });

  it('should call applyDecorators with correct ApiResponse configuration', () => {
    const expectedResult = jest.fn();
    mockApplyDecorators.mockReturnValue(expectedResult);
    const result = ApiStandardResponses();

    expect(result).toBe(expectedResult);
    expect(mockApiResponse).toHaveBeenCalledWith({
      status: 'default',
      description: 'Error Response',
      type: ErrorResponseDto,
    });
    expect(mockApplyDecorators).toHaveBeenCalledWith(expect.any(Function));
  });
});
