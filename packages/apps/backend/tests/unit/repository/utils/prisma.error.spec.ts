import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

import { isPrismaError, PRISMA_ERROR_CODE_MAP, isPrismaErrorCode } from '@/repository/utils/prisma.error';

describe('function isPrismaError', () => {
  it.each([
    [
      'PrismaClientKnownRequestError',
      new PrismaClientKnownRequestError('Test', { code: 'P2002', clientVersion: '1.0.0' }),
    ],
    ['PrismaClientUnknownRequestError', new PrismaClientUnknownRequestError('Test', { clientVersion: '1.0.0' })],
    ['PrismaClientRustPanicError', new PrismaClientRustPanicError('Test', '1.0.0')],
    ['PrismaClientInitializationError', new PrismaClientInitializationError('Test', '1.0.0')],
    ['PrismaClientValidationError', new PrismaClientValidationError('Test', { clientVersion: '1.0.0' })],
  ])('should return true for %s', (_errorType, error) => {
    expect(isPrismaError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    expect.assertions(1);

    const error = new Error('Test');

    expect(isPrismaError(error)).toBe(false);
  });

  it.each([
    [null, 'null'],
    [undefined, 'undefined'],
    ['string', 'string'],
    [{}, 'object'],
  ])('should return false for %s', (value, _type) => {
    expect(isPrismaError(value)).toBe(false);
  });
});

describe('constant PRISMA_ERROR_CODE_MAP', () => {
  describe('connection errors', () => {
    it.each([
      ['P1000', 'RE0221'],
      ['P1001', 'RE0209'],
      ['P1002', 'RE0203'],
      ['P1003', 'RE0201'],
    ])('%s should map to %s', (prismaCode, repoCode) => {
      expect(PRISMA_ERROR_CODE_MAP[prismaCode as keyof typeof PRISMA_ERROR_CODE_MAP]).toBe(repoCode);
    });
  });

  describe('data validation errors', () => {
    it.each([
      ['P2000', 'RE0001'],
      ['P2001', 'RE0002'],
      ['P2002', 'RE0003'],
      ['P2003', 'RE0004'],
    ])('%s should map to %s', (prismaCode, repoCode) => {
      expect(PRISMA_ERROR_CODE_MAP[prismaCode as keyof typeof PRISMA_ERROR_CODE_MAP]).toBe(repoCode);
    });
  });

  describe('query errors', () => {
    it.each([
      ['P2008', 'RE0101'],
      ['P2009', 'RE0102'],
      ['P2010', 'RE0103'],
      ['P2011', 'RE0104'],
    ])('%s should map to %s', (prismaCode, repoCode) => {
      expect(PRISMA_ERROR_CODE_MAP[prismaCode as keyof typeof PRISMA_ERROR_CODE_MAP]).toBe(repoCode);
    });
  });

  describe('migration errors', () => {
    it.each([
      ['P3000', 'RE0301'],
      ['P3001', 'RE0302'],
      ['P3002', 'RE0303'],
      ['P3003', 'RE0310'],
    ])('%s should map to %s', (prismaCode, repoCode) => {
      expect(PRISMA_ERROR_CODE_MAP[prismaCode as keyof typeof PRISMA_ERROR_CODE_MAP]).toBe(repoCode);
    });
  });

  describe('introspection errors', () => {
    it.each([
      ['P4000', 'RE0232'],
      ['P4001', 'RE0233'],
      ['P4002', 'RE0231'],
    ])('%s should map to %s', (prismaCode, repoCode) => {
      expect(PRISMA_ERROR_CODE_MAP[prismaCode as keyof typeof PRISMA_ERROR_CODE_MAP]).toBe(repoCode);
    });
  });

  describe('prisma Accelerate errors', () => {
    it.each([
      ['P6000', 'RE0234'],
      ['P6001', 'RE0235'],
      ['P6002', 'RE0209'],
      ['P6003', 'RE0236'],
    ])('%s should map to %s', (prismaCode, repoCode) => {
      expect(PRISMA_ERROR_CODE_MAP[prismaCode as keyof typeof PRISMA_ERROR_CODE_MAP]).toBe(repoCode);
    });
  });

  it.each(['P2002', 'P2025', 'P1001', 'P3000'])('should have required error mapping for %s', (code) => {
    expect(PRISMA_ERROR_CODE_MAP[code as keyof typeof PRISMA_ERROR_CODE_MAP]).toBeDefined();
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
  it.each(['P2002', 'P2025', 'P1001', 'P3000', 'P6000'])(
    'should return true for valid Prisma error code %s',
    (code) => {
      expect(isPrismaErrorCode(code)).toBe(true);
    },
  );

  it.each([
    ['P9999', 'non-existent code'],
    ['INVALID', 'invalid format'],
    ['RE0001', 'repository error code'],
    ['', 'empty string'],
  ])('should return false for %s (%s)', (code, _reason) => {
    expect(isPrismaErrorCode(code)).toBe(false);
  });

  it.each([
    [null, 'null'],
    [undefined, 'undefined'],
    [123, 'number'],
    [{}, 'object'],
  ])('should return false for %s (%s)', (value, _type) => {
    expect(isPrismaErrorCode(value)).toBe(false);
  });
});

describe('error code mapping completeness', () => {
  it.each([
    ['P2002', 'RE0003', 'unique constraint'],
    ['P2001', 'RE0002', 'record not found'],
    ['P2025', 'RE0002', 'record not found'],
    ['P1001', 'RE0209', 'connection failed'],
    ['P1002', 'RE0203', 'connection timeout'],
    ['P2003', 'RE0004', 'foreign key constraint'],
  ])('%s should map to %s for %s', (prismaCode, repoCode, _scenario) => {
    expect(PRISMA_ERROR_CODE_MAP[prismaCode as keyof typeof PRISMA_ERROR_CODE_MAP]).toBe(repoCode);
  });

  describe('error code category mapping', () => {
    it.each([
      ['P1', 'connection errors'],
      ['P2', 'data/query errors'],
      ['P3', 'migration errors'],
    ])('should map all %s*** %s', (prefix, _category) => {
      expect.hasAssertions();

      const errors = Object.keys(PRISMA_ERROR_CODE_MAP).filter((code) => code.startsWith(prefix));

      errors.forEach((code) => {
        expect(PRISMA_ERROR_CODE_MAP[code as keyof typeof PRISMA_ERROR_CODE_MAP]).toMatch(/^RE\d{4}$/u);
      });

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
