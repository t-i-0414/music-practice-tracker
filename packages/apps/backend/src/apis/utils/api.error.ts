import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { type RepositoryErrorCode } from '@/repository/utils/repository.error';
import { CommonError, type CommonErrorOptions } from '@/utils/errors/common.error';
import { ErrorCategory } from '@/utils/errors/error-category';
import { apiErrorPrefix, type ErrorCode, isErrorCode, type PreservedApiErrorCode } from '@/utils/errors/error-code';
import { ErrorSeverity } from '@/utils/errors/error-severity';

const resolveCategory = (errorCode: ApiErrorCode): ErrorCategory => {
  if (errorCode === 'AP0401') return ErrorCategory.AUTHENTICATION;
  if (errorCode === 'AP0403') return ErrorCategory.AUTHORIZATION;
  if (errorCode >= 'AP0500' || errorCode === 'AP9999') return ErrorCategory.UNKNOWN;
  return ErrorCategory.VALIDATION;
};

export class ApiError extends CommonError<ApiErrorCode> {
  public constructor(errorCode: ApiErrorCode, detail: string, cause?: unknown, options?: Partial<CommonErrorOptions>) {
    super(errorCode, detail, cause, {
      severity: options?.severity ?? ErrorSeverity.MEDIUM,
      category: options?.category ?? resolveCategory(errorCode),
      isOperational: options?.isOperational ?? true,
    });
  }
}
export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export type ApiErrorCode = Extract<ErrorCode, PreservedApiErrorCode>;
export const isApiErrorCode = (value: string): value is ApiErrorCode =>
  isErrorCode(value) && value.startsWith(apiErrorPrefix);

export const HTTP_STATUS_ERROR_CODE_RECORD_BY_REPOSITORY_ERROR_CODE: Record<RepositoryErrorCode, HttpStatus> = {
  // Repository Errors - Data Validation (RE00xx)
  RE0001: HttpStatus.BAD_REQUEST, // Column value too long
  RE0002: HttpStatus.NOT_FOUND, // Record not found
  RE0003: HttpStatus.CONFLICT, // Unique constraint violation
  RE0004: HttpStatus.CONFLICT, // Foreign key constraint violation
  RE0005: HttpStatus.CONFLICT, // Database constraint violation
  RE0006: HttpStatus.BAD_REQUEST, // Invalid field value type
  RE0007: HttpStatus.BAD_REQUEST, // Invalid field value
  RE0008: HttpStatus.BAD_REQUEST, // Data validation error

  // Repository Errors - Query Errors (RE01xx)
  RE0101: HttpStatus.BAD_REQUEST, // Query parsing failed
  RE0102: HttpStatus.BAD_REQUEST, // Query validation failed
  RE0103: HttpStatus.INTERNAL_SERVER_ERROR, // Raw query execution failed
  RE0104: HttpStatus.BAD_REQUEST, // Null constraint violation
  RE0105: HttpStatus.BAD_REQUEST, // Missing required value
  RE0106: HttpStatus.BAD_REQUEST, // Missing required argument
  RE0107: HttpStatus.CONFLICT, // Relation violation
  RE0108: HttpStatus.NOT_FOUND, // Related record not found
  RE0109: HttpStatus.BAD_REQUEST, // Query interpretation error
  RE0110: HttpStatus.CONFLICT, // Relation records not connected
  RE0111: HttpStatus.NOT_FOUND, // Required connected records not found
  RE0112: HttpStatus.BAD_REQUEST, // Input error in query
  RE0113: HttpStatus.BAD_REQUEST, // Value out of range in query

  // Repository Errors - Connection & System (RE02xx)
  RE0201: HttpStatus.NOT_FOUND, // Table does not exist
  RE0202: HttpStatus.BAD_REQUEST, // Column does not exist
  RE0203: HttpStatus.REQUEST_TIMEOUT, // Connection pool timeout
  RE0204: HttpStatus.NOT_IMPLEMENTED, // Unsupported database feature
  RE0205: HttpStatus.CONFLICT, // Transaction write conflict
  RE0206: HttpStatus.SERVICE_UNAVAILABLE, // Database initialization error
  RE0207: HttpStatus.INTERNAL_SERVER_ERROR, // Database engine panic
  RE0208: HttpStatus.INTERNAL_SERVER_ERROR, // Unknown database error
  RE0209: HttpStatus.SERVICE_UNAVAILABLE, // Database connection failed
  RE0210: HttpStatus.SERVICE_UNAVAILABLE, // Database service unavailable
  RE0211: HttpStatus.INTERNAL_SERVER_ERROR, // Inconsistent column data
  RE0212: HttpStatus.INTERNAL_SERVER_ERROR, // Multiple errors occurred
  RE0213: HttpStatus.INTERNAL_SERVER_ERROR, // Transaction API error
  RE0214: HttpStatus.PAYLOAD_TOO_LARGE, // Query parameter limit exceeded
  RE0215: HttpStatus.NOT_FOUND, // Cannot find full-text index
  RE0216: HttpStatus.SERVICE_UNAVAILABLE, // MongoDB connection failure
  RE0217: HttpStatus.BAD_REQUEST, // Number parsing error
  RE0218: HttpStatus.INTERNAL_SERVER_ERROR, // Database assertion violation
  RE0219: HttpStatus.SERVICE_UNAVAILABLE, // External connector error
  RE0220: HttpStatus.SERVICE_UNAVAILABLE, // Too many database connections
  RE0221: HttpStatus.UNAUTHORIZED, // Authentication failed
  RE0222: HttpStatus.CONFLICT, // Database already exists
  RE0223: HttpStatus.FORBIDDEN, // Access denied to database
  RE0224: HttpStatus.SERVICE_UNAVAILABLE, // TLS connection error
  RE0225: HttpStatus.BAD_REQUEST, // Schema validation error
  RE0226: HttpStatus.BAD_REQUEST, // Invalid connection string
  RE0227: HttpStatus.NOT_FOUND, // Underlying model does not exist
  RE0228: HttpStatus.SERVICE_UNAVAILABLE, // Unsupported database version
  RE0229: HttpStatus.BAD_REQUEST, // Incorrect parameter count
  RE0230: HttpStatus.SERVICE_UNAVAILABLE, // Server closed connection
  RE0231: HttpStatus.INTERNAL_SERVER_ERROR, // Schema inconsistency
  RE0232: HttpStatus.INTERNAL_SERVER_ERROR, // Introspection failed
  RE0233: HttpStatus.NOT_FOUND, // Introspected database was empty
  RE0234: HttpStatus.SERVICE_UNAVAILABLE, // Prisma Accelerate server error
  RE0235: HttpStatus.BAD_REQUEST, // Invalid Prisma Accelerate data source
  RE0236: HttpStatus.PAYMENT_REQUIRED, // Prisma Accelerate plan limit
  RE0237: HttpStatus.REQUEST_TIMEOUT, // Prisma Accelerate query timeout
  RE0238: HttpStatus.BAD_REQUEST, // Invalid Prisma Accelerate parameters
  RE0239: HttpStatus.SERVICE_UNAVAILABLE, // Prisma Accelerate version not supported
  RE0240: HttpStatus.SERVICE_UNAVAILABLE, // Prisma Accelerate engine start error
  RE0241: HttpStatus.PAYLOAD_TOO_LARGE, // Prisma Accelerate response size exceeded
  RE0242: HttpStatus.FORBIDDEN, // Prisma Accelerate project disabled

  // Repository Errors - Migration (RE03xx)
  RE0301: HttpStatus.INTERNAL_SERVER_ERROR, // Failed to create database
  RE0302: HttpStatus.CONFLICT, // Migration contains data loss
  RE0303: HttpStatus.INTERNAL_SERVER_ERROR, // Migration rollback error
  RE0304: HttpStatus.FORBIDDEN, // Cannot alter system database
  RE0305: HttpStatus.CONFLICT, // Non-empty schema conflict
  RE0306: HttpStatus.CONFLICT, // Failed migrations detected
  RE0307: HttpStatus.INTERNAL_SERVER_ERROR, // Migration application failure
  RE0308: HttpStatus.NOT_IMPLEMENTED, // Foreign key creation not supported
  RE0309: HttpStatus.FORBIDDEN, // Direct DDL statements disabled
  RE0310: HttpStatus.CONFLICT, // Migration format changed
  RE0311: HttpStatus.NOT_FOUND, // Migration not found
  RE0312: HttpStatus.BAD_REQUEST, // Preview features not allowed
  RE0313: HttpStatus.CONFLICT, // Migration already applied
  RE0314: HttpStatus.BAD_REQUEST, // Migration name too long
  RE0315: HttpStatus.CONFLICT, // Migration cannot be rolled back
  RE0316: HttpStatus.CONFLICT, // Migration cannot be applied
  RE0317: HttpStatus.BAD_REQUEST, // Provider arrays different length
  RE0318: HttpStatus.NOT_FOUND, // Datasource provider not found
  RE0319: HttpStatus.NOT_FOUND, // Migration file not found
  RE0320: HttpStatus.INTERNAL_SERVER_ERROR, // Incorrect migration cleanup
  RE0321: HttpStatus.NOT_FOUND, // Migration not found to apply
  RE0322: HttpStatus.INTERNAL_SERVER_ERROR, // Migration failed to apply
  RE0323: HttpStatus.CONFLICT, // Datasource provider mismatch
  RE0324: HttpStatus.INTERNAL_SERVER_ERROR, // Shadow database creation failed
  RE0325: HttpStatus.SERVICE_UNAVAILABLE, // Databases not supported in this version
  RE0326: HttpStatus.FORBIDDEN, // Failed to create database: permission denied

  // Repository Errors - Generic
  RE9999: HttpStatus.INTERNAL_SERVER_ERROR, // Unknown repository error
};

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  public statusCode: HttpStatus;

  @ApiProperty({ example: 'RE0002' })
  public errorCode: ErrorCode;
}
