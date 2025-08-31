import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

import { type RepositoryErrorCode } from './repository.error';

export type PrismaError =
  | PrismaClientKnownRequestError
  | PrismaClientUnknownRequestError
  | PrismaClientRustPanicError
  | PrismaClientInitializationError
  | PrismaClientValidationError;

export const isPrismaError = (error: unknown): error is PrismaError =>
  error instanceof PrismaClientKnownRequestError ||
  error instanceof PrismaClientUnknownRequestError ||
  error instanceof PrismaClientRustPanicError ||
  error instanceof PrismaClientInitializationError ||
  error instanceof PrismaClientValidationError;

/**
 * https://www.prisma.io/docs/orm/reference/error-reference#error-codes
 */
export const PRISMA_ERROR_CODE_MAP = {
  // Connection Errors (P1xxx)
  P1000: 'RE0221', // Authentication failed
  P1001: 'RE0209', // Can't reach database server
  P1002: 'RE0203', // Database server timeout
  P1003: 'RE0201', // Database does not exist
  P1008: 'RE0203', // Operations timeout
  P1009: 'RE0222', // Database already exists
  P1010: 'RE0223', // Access denied
  P1011: 'RE0224', // TLS connection error
  P1012: 'RE0225', // Schema validation error
  P1013: 'RE0226', // Invalid database string
  P1014: 'RE0227', // Underlying model does not exist
  P1015: 'RE0228', // Unsupported database version
  P1016: 'RE0229', // Incorrect parameters count
  P1017: 'RE0230', // Server closed connection

  // Data Validation Errors (P2xxx)
  P2000: 'RE0001', // Value too long for column
  P2001: 'RE0002', // Record not found where condition
  P2002: 'RE0003', // Unique constraint failed
  P2003: 'RE0004', // Foreign key constraint failed
  P2004: 'RE0005', // Constraint failed on database
  P2005: 'RE0006', // Invalid value type stored
  P2006: 'RE0007', // Invalid value provided
  P2007: 'RE0008', // Data validation error

  // Query Errors
  P2008: 'RE0101', // Failed to parse query
  P2009: 'RE0102', // Failed to validate query
  P2010: 'RE0103', // Raw query failed
  P2011: 'RE0104', // Null constraint violation
  P2012: 'RE0105', // Missing required value
  P2013: 'RE0106', // Missing required argument
  P2014: 'RE0107', // Relation violation
  P2015: 'RE0108', // Related record not found
  P2016: 'RE0109', // Query interpretation error
  P2017: 'RE0110', // Relation records not connected
  P2018: 'RE0111', // Required connected records not found
  P2019: 'RE0112', // Input error
  P2020: 'RE0113', // Value out of range

  // Connection & System Errors
  P2021: 'RE0201', // Table does not exist
  P2022: 'RE0202', // Column does not exist
  P2023: 'RE0211', // Inconsistent column data
  P2024: 'RE0203', // Timed out fetching connection from pool
  P2025: 'RE0002', // Record to delete/update not found
  P2026: 'RE0204', // Unsupported feature
  P2027: 'RE0212', // Multiple errors during execution
  P2028: 'RE0213', // Transaction API error
  P2029: 'RE0214', // Query parameter limit exceeded
  P2030: 'RE0215', // Cannot find full-text index
  P2031: 'RE0216', // MongoDB server connection failure
  P2033: 'RE0217', // Number used in place where not parsable
  P2034: 'RE0205', // Transaction failed due to write conflict
  P2035: 'RE0218', // Assertion violation
  P2036: 'RE0219', // External connector error
  P2037: 'RE0220', // Too many connections

  // Migration Errors (P3xxx)
  P3000: 'RE0301', // Failed to create database
  P3001: 'RE0302', // Migration possible with data loss
  P3002: 'RE0303', // Migration rollback attempted
  P3003: 'RE0310', // Migration format changed
  P3004: 'RE0304', // System database alteration
  P3005: 'RE0305', // Non-empty schema
  P3006: 'RE0311', // Migration not found
  P3007: 'RE0312', // Preview features not allowed
  P3008: 'RE0313', // Migration already applied
  P3009: 'RE0306', // Failed migrations found
  P3010: 'RE0314', // Migration name too long
  P3011: 'RE0315', // Migration cannot be rolled back
  P3012: 'RE0316', // Migration cannot be applied
  P3013: 'RE0317', // Provider arrays have different length
  P3014: 'RE0318', // Datasource provider not found
  P3015: 'RE0319', // Migration file not found
  P3016: 'RE0320', // Incorrect migration cleanup
  P3017: 'RE0321', // Migration not found to apply
  P3018: 'RE0322', // Migration failed to apply
  P3019: 'RE0323', // Datasource provider mismatch
  P3020: 'RE0324', // Shadow database creation failed
  P3021: 'RE0308', // Foreign keys not supported
  P3022: 'RE0309', // Direct DDL not enabled
  P3023: 'RE0325', // Databases created in this version of Prisma CLI are not supported
  P3024: 'RE0326', // Failed to create database: permission denied

  // Introspection Errors (P4xxx)
  P4000: 'RE0232', // Introspection operation failed
  P4001: 'RE0233', // Introspected database was empty
  P4002: 'RE0231', // Schema of introspected database was inconsistent

  // Prisma Accelerate Rate Limit (P5xxx)
  P5011: 'RE0203', // Too many requests

  // Prisma Accelerate Errors (P6xxx)
  P6000: 'RE0234', // Generic server error
  P6001: 'RE0235', // Invalid data source URL
  P6002: 'RE0209', // Unauthorized - Invalid API key
  P6003: 'RE0236', // Plan limit reached
  P6004: 'RE0237', // Query timeout exceeded
  P6005: 'RE0238', // Invalid parameters
  P6006: 'RE0239', // Version not supported
  P6008: 'RE0240', // Connection/Engine start error
  P6009: 'RE0241', // Response size limit exceeded
  P6010: 'RE0242', // Project disabled
} as const satisfies Record<string, RepositoryErrorCode>;

export type PrismaErrorCode = keyof typeof PRISMA_ERROR_CODE_MAP;
export const isPrismaErrorCode = (code: string): code is PrismaErrorCode => code in PRISMA_ERROR_CODE_MAP;
