export const applicationErrorPrefix = 'AP';
export const domainErrorPrefix = 'DO';
export const repositoryErrorPrefix = 'RE';
export const unknownErrorPrefix = 'UN';

export type ErrorPrefix =
  | typeof applicationErrorPrefix
  | typeof domainErrorPrefix
  | typeof repositoryErrorPrefix
  | typeof unknownErrorPrefix;
export const isErrorPrefix = (value: string): value is ErrorPrefix =>
  [applicationErrorPrefix, domainErrorPrefix, repositoryErrorPrefix, unknownErrorPrefix].includes(value);

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type FourDigits = `${Digit}${Digit}${Digit}${Digit}`;
type PreservedApplicationErrorCode = `${typeof applicationErrorPrefix}${FourDigits}`;
type PreservedDomainErrorCode = `${typeof domainErrorPrefix}${FourDigits}`;
type PreservedRepositoryErrorCode = `${typeof repositoryErrorPrefix}${FourDigits}`;
type PreservedUnknownErrorCode = `${typeof unknownErrorPrefix}${FourDigits}`;
type PreservedErrorCode =
  | PreservedApplicationErrorCode
  | PreservedDomainErrorCode
  | PreservedRepositoryErrorCode
  | PreservedUnknownErrorCode;

/**
 * #### ErrorCode
 * - AP xxxx: Application Errors
 * - DO xxxx: Domain Errors
 * - RE xxxx: Repository Errors
 * - UN xxxx: Unknown Errors
 */
export const ERROR_CODE_RECORDS = {
  // Application Errors
  AP9999: 'Unknown application error.',

  // Domain Errors
  DO9999: 'Unknown domain error.',

  // Repository Errors - Data Validation (RE00xx)
  RE0001: 'Column value too long for database field.',
  RE0002: 'Record not found in database.',
  RE0003: 'Unique constraint violation.',
  RE0004: 'Foreign key constraint violation.',
  RE0005: 'Database constraint violation.',
  RE0006: 'Invalid field value type.',
  RE0007: 'Invalid field value.',
  RE0008: 'Data validation error.',

  // Repository Errors - Query Errors (RE01xx)
  RE0101: 'Query parsing failed.',
  RE0102: 'Query validation failed.',
  RE0103: 'Raw query execution failed.',
  RE0104: 'Null constraint violation.',
  RE0105: 'Missing required value.',
  RE0106: 'Missing required argument.',
  RE0107: 'Relation violation.',
  RE0108: 'Related record not found.',
  RE0109: 'Query interpretation error.',
  RE0110: 'Relation records not connected.',
  RE0111: 'Required connected records not found.',
  RE0112: 'Input error in query.',
  RE0113: 'Value out of range in query.',

  // Repository Errors - Connection & System (RE02xx)
  RE0201: 'Table does not exist in database.',
  RE0202: 'Column does not exist in table.',
  RE0203: 'Connection pool timeout.',
  RE0204: 'Unsupported database feature.',
  RE0205: 'Transaction failed due to write conflict.',
  RE0206: 'Database initialization error.',
  RE0207: 'Database engine panic.',
  RE0208: 'Unknown database error.',
  RE0209: 'Database connection failed.',
  RE0210: 'Database service unavailable.',
  RE0211: 'Inconsistent column data in database.',
  RE0212: 'Multiple errors occurred during database execution.',
  RE0213: 'Transaction API error.',
  RE0214: 'Query parameter limit exceeded.',
  RE0215: 'Cannot find fulltext index.',
  RE0216: 'MongoDB server connection failure.',
  RE0217: 'Number parsing error in database query.',
  RE0218: 'Database assertion violation.',
  RE0219: 'External connector error.',
  RE0220: 'Too many database connections.',
  RE0221: 'Authentication failed for database.',
  RE0222: 'Database already exists.',
  RE0223: 'Access denied to database.',
  RE0224: 'TLS connection error.',
  RE0225: 'Schema validation error.',
  RE0226: 'Invalid database connection string.',
  RE0227: 'Underlying model does not exist.',
  RE0228: 'Unsupported database version.',
  RE0229: 'Incorrect parameter count.',
  RE0230: 'Server closed connection.',
  RE0231: 'Schema inconsistency in introspected database.',
  RE0232: 'Introspection operation failed.',
  RE0233: 'Introspected database was empty.',
  RE0234: 'Generic Prisma Accelerate server error.',
  RE0235: 'Invalid Prisma Accelerate data source.',
  RE0236: 'Prisma Accelerate plan limit reached.',
  RE0237: 'Prisma Accelerate query timeout.',
  RE0238: 'Invalid Prisma Accelerate parameters.',
  RE0239: 'Prisma Accelerate version not supported.',
  RE0240: 'Prisma Accelerate engine start error.',
  RE0241: 'Prisma Accelerate response size exceeded.',
  RE0242: 'Prisma Accelerate project disabled.',

  // Repository Errors - Migration (RE03xx)
  RE0301: 'Failed to create database.',
  RE0302: 'Migration contains potential data loss.',
  RE0303: 'Migration rollback error.',
  RE0304: 'Cannot alter system database.',
  RE0305: 'Non-empty schema conflict.',
  RE0306: 'Failed migrations detected.',
  RE0307: 'Migration application failure.',
  RE0308: 'Foreign key creation not supported.',
  RE0309: 'Direct DDL statements disabled.',
  RE0310: 'Migration format changed.',
  RE0311: 'Migration not found.',
  RE0312: 'Preview features not allowed in migration.',
  RE0313: 'Migration already applied.',
  RE0314: 'Migration name too long.',
  RE0315: 'Migration cannot be rolled back.',
  RE0316: 'Migration cannot be applied.',
  RE0317: 'Provider arrays have different length.',
  RE0318: 'Datasource provider not found.',
  RE0319: 'Migration file not found.',
  RE0320: 'Incorrect migration cleanup.',
  RE0321: 'Migration not found to apply.',
  RE0322: 'Migration failed to apply.',
  RE0323: 'Datasource provider mismatch.',
  RE0324: 'Shadow database creation failed.',
  RE0325: 'Databases created in this Prisma version not supported.',
  RE0326: 'Failed to create database: permission denied.',

  // Repository Errors - Generic
  RE9999: 'Unknown repository error.',

  // Unknown Errors
  UN9999: 'Unknown error.',
} as const satisfies Partial<Record<PreservedErrorCode, string>>;
export type ErrorCode = keyof typeof ERROR_CODE_RECORDS;
export type ErrorMessage = (typeof ERROR_CODE_RECORDS)[ErrorCode];
export const isErrorCode = (value: string): value is ErrorCode => value in ERROR_CODE_RECORDS;

export type ApplicationErrorCode = Extract<ErrorCode, PreservedApplicationErrorCode>;
export type ApplicationErrorMessage = Extract<ErrorMessage, (typeof ERROR_CODE_RECORDS)[ApplicationErrorCode]>;
export const isApplicationErrorCode = (value: string): value is ApplicationErrorCode =>
  isErrorCode(value) && value.startsWith(applicationErrorPrefix);

export type DomainErrorCode = Extract<ErrorCode, PreservedDomainErrorCode>;
export type DomainErrorMessage = Extract<ErrorMessage, (typeof ERROR_CODE_RECORDS)[DomainErrorCode]>;
export const isDomainErrorCode = (value: string): value is DomainErrorCode =>
  isErrorCode(value) && value.startsWith(domainErrorPrefix);

export type RepositoryErrorCode = Extract<ErrorCode, PreservedRepositoryErrorCode>;
export type RepositoryErrorMessage = Extract<ErrorMessage, (typeof ERROR_CODE_RECORDS)[RepositoryErrorCode]>;
export const isRepositoryErrorCode = (value: string): value is RepositoryErrorCode =>
  isErrorCode(value) && value.startsWith(repositoryErrorPrefix);

export type UnknownErrorCode = Extract<ErrorCode, PreservedUnknownErrorCode>;
export type UnknownErrorMessage = Extract<ErrorMessage, (typeof ERROR_CODE_RECORDS)[UnknownErrorCode]>;
export const isUnknownErrorCode = (value: string): value is UnknownErrorCode =>
  isErrorCode(value) && value.startsWith(unknownErrorPrefix);
