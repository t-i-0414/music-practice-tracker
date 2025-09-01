import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

import { isPrismaError, PRISMA_ERROR_CODE_MAP, isPrismaErrorCode } from '@/repository/utils/prisma.error';

describe('function isPrismaError', () => {
  it('should return true for PrismaClientKnownRequestError', () => {
    expect.assertions(1);

    const error = new PrismaClientKnownRequestError('Test', { code: 'P2002', clientVersion: '1.0.0' });

    expect(isPrismaError(error)).toBe(true);
  });

  it('should return true for PrismaClientUnknownRequestError', () => {
    expect.assertions(1);

    const error = new PrismaClientUnknownRequestError('Test', { clientVersion: '1.0.0' });

    expect(isPrismaError(error)).toBe(true);
  });

  it('should return true for PrismaClientRustPanicError', () => {
    expect.assertions(1);

    const error = new PrismaClientRustPanicError('Test', '1.0.0');

    expect(isPrismaError(error)).toBe(true);
  });

  it('should return true for PrismaClientInitializationError', () => {
    expect.assertions(1);

    const error = new PrismaClientInitializationError('Test', '1.0.0');

    expect(isPrismaError(error)).toBe(true);
  });

  it('should return true for PrismaClientValidationError', () => {
    expect.assertions(1);

    const error = new PrismaClientValidationError('Test', { clientVersion: '1.0.0' });

    expect(isPrismaError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    expect.assertions(1);

    const error = new Error('Test');

    expect(isPrismaError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect.assertions(4);

    expect(isPrismaError(null)).toBe(false);
    expect(isPrismaError(undefined)).toBe(false);
    expect(isPrismaError('string')).toBe(false);
    expect(isPrismaError({})).toBe(false);
  });
});

describe('constant PRISMA_ERROR_CODE_MAP', () => {
  it('should map connection errors correctly', () => {
    expect(PRISMA_ERROR_CODE_MAP.P1000).toBe('RE0221');
    expect(PRISMA_ERROR_CODE_MAP.P1001).toBe('RE0209');
    expect(PRISMA_ERROR_CODE_MAP.P1002).toBe('RE0203');
    expect(PRISMA_ERROR_CODE_MAP.P1003).toBe('RE0201');
  });

  it('should map data validation errors correctly', () => {
    expect(PRISMA_ERROR_CODE_MAP.P2000).toBe('RE0001');
    expect(PRISMA_ERROR_CODE_MAP.P2001).toBe('RE0002');
    expect(PRISMA_ERROR_CODE_MAP.P2002).toBe('RE0003');
    expect(PRISMA_ERROR_CODE_MAP.P2003).toBe('RE0004');
  });

  it('should map query errors correctly', () => {
    expect(PRISMA_ERROR_CODE_MAP.P2008).toBe('RE0101');
    expect(PRISMA_ERROR_CODE_MAP.P2009).toBe('RE0102');
    expect(PRISMA_ERROR_CODE_MAP.P2010).toBe('RE0103');
    expect(PRISMA_ERROR_CODE_MAP.P2011).toBe('RE0104');
  });

  it('should map migration errors correctly', () => {
    expect(PRISMA_ERROR_CODE_MAP.P3000).toBe('RE0301');
    expect(PRISMA_ERROR_CODE_MAP.P3001).toBe('RE0302');
    expect(PRISMA_ERROR_CODE_MAP.P3002).toBe('RE0303');
    expect(PRISMA_ERROR_CODE_MAP.P3003).toBe('RE0310');
  });

  it('should map introspection errors correctly', () => {
    expect(PRISMA_ERROR_CODE_MAP.P4000).toBe('RE0232');
    expect(PRISMA_ERROR_CODE_MAP.P4001).toBe('RE0233');
    expect(PRISMA_ERROR_CODE_MAP.P4002).toBe('RE0231');
  });

  it('should map Prisma Accelerate errors correctly', () => {
    expect(PRISMA_ERROR_CODE_MAP.P6000).toBe('RE0234');
    expect(PRISMA_ERROR_CODE_MAP.P6001).toBe('RE0235');
    expect(PRISMA_ERROR_CODE_MAP.P6002).toBe('RE0209');
    expect(PRISMA_ERROR_CODE_MAP.P6003).toBe('RE0236');
  });

  it('should have all required error mappings', () => {
    expect.assertions(5);

    // Check that some key error codes are mapped
    const requiredCodes = ['P2002', 'P2025', 'P1001', 'P3000'];

    requiredCodes.forEach((code) => {
      expect(PRISMA_ERROR_CODE_MAP[code as keyof typeof PRISMA_ERROR_CODE_MAP]).toBeDefined();
    });

    expect(requiredCodes).toHaveLength(4);
  });

  it('should map to valid repository error codes', () => {
    expect.hasAssertions();

    const values = Object.values(PRISMA_ERROR_CODE_MAP);

    values.forEach((errorCode) => {
      expect(errorCode).toMatch(/^RE\d{4}$/u);
    });

    expect(values.length).toBeGreaterThan(0);
  });
});

describe('function isPrismaErrorCode', () => {
  it('should return true for valid Prisma error codes', () => {
    expect(isPrismaErrorCode('P2002')).toBe(true);
    expect(isPrismaErrorCode('P2025')).toBe(true);
    expect(isPrismaErrorCode('P1001')).toBe(true);
    expect(isPrismaErrorCode('P3000')).toBe(true);
    expect(isPrismaErrorCode('P6000')).toBe(true);
  });

  it('should return false for invalid Prisma error codes', () => {
    expect(isPrismaErrorCode('P9999')).toBe(false);
    expect(isPrismaErrorCode('INVALID')).toBe(false);
    expect(isPrismaErrorCode('RE0001')).toBe(false);
    expect(isPrismaErrorCode('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isPrismaErrorCode(null)).toBe(false);
    expect(isPrismaErrorCode(undefined)).toBe(false);
    expect(isPrismaErrorCode(123)).toBe(false);
    expect(isPrismaErrorCode({})).toBe(false);
  });
});

describe('error code mapping completeness', () => {
  it('should cover common Prisma error scenarios', () => {
    // Unique constraint violation
    expect(PRISMA_ERROR_CODE_MAP.P2002).toBe('RE0003');

    // Record not found
    expect(PRISMA_ERROR_CODE_MAP.P2001).toBe('RE0002');
    expect(PRISMA_ERROR_CODE_MAP.P2025).toBe('RE0002');

    // Connection failures
    expect(PRISMA_ERROR_CODE_MAP.P1001).toBe('RE0209');
    expect(PRISMA_ERROR_CODE_MAP.P1002).toBe('RE0203');

    // Foreign key violations
    expect(PRISMA_ERROR_CODE_MAP.P2003).toBe('RE0004');
  });

  it('should map all P1xxx connection errors', () => {
    expect.hasAssertions();

    const connectionErrors = Object.keys(PRISMA_ERROR_CODE_MAP).filter((code) => code.startsWith('P1'));

    connectionErrors.forEach((code) => {
      expect(PRISMA_ERROR_CODE_MAP[code as keyof typeof PRISMA_ERROR_CODE_MAP]).toMatch(/^RE\d{4}$/u);
    });

    expect(connectionErrors.length).toBeGreaterThan(0);
  });

  it('should map all P2xxx data/query errors', () => {
    expect.hasAssertions();

    const dataErrors = Object.keys(PRISMA_ERROR_CODE_MAP).filter((code) => code.startsWith('P2'));

    dataErrors.forEach((code) => {
      expect(PRISMA_ERROR_CODE_MAP[code as keyof typeof PRISMA_ERROR_CODE_MAP]).toMatch(/^RE\d{4}$/u);
    });

    expect(dataErrors.length).toBeGreaterThan(0);
  });

  it('should map all P3xxx migration errors', () => {
    expect.hasAssertions();

    const migrationErrors = Object.keys(PRISMA_ERROR_CODE_MAP).filter((code) => code.startsWith('P3'));

    migrationErrors.forEach((code) => {
      expect(PRISMA_ERROR_CODE_MAP[code as keyof typeof PRISMA_ERROR_CODE_MAP]).toMatch(/^RE\d{4}$/u);
    });

    expect(migrationErrors.length).toBeGreaterThan(0);
  });
});
