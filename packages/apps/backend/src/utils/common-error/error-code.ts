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

  // Repository Errors
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
