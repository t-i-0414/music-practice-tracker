import { type HttpStatus } from '@nestjs/common';

import { type CommonErrorBody } from '@/utils/common.error';

export type SuccessResponse<T> = {
  statusCode: HttpStatus;
  data: T;
};

export type ErrorResponse = {
  statusCode: HttpStatus;
} & CommonErrorBody;

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function isErrorResponse(response: ApiResponse<unknown>): response is ErrorResponse {
  return response.statusCode.valueOf() >= 400;
}
