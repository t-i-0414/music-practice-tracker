import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ErrorResponseDto } from '../api.error';

export function ApiStandardResponses(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    ApiResponse({
      status: 'default',
      description: 'Error Response',
      type: ErrorResponseDto,
    }),
  );
}
