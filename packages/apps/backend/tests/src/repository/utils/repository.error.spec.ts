import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@/generated/prisma/runtime/client';
import { isPrismaError, isPrismaErrorCode, type PrismaError } from '@/repository/utils/prisma.error';
import {
  RepositoryError,
  canConvertToRepositoryError,
  buildRepositoryError,
} from '@/repository/utils/repository.error';

jest.mock<typeof import('../../../../src/repository/utils/prisma.error')>(
  '../../../../src/repository/utils/prisma.error',
  () => {
    const actual = jest.requireActual('@/repository/utils/prisma.error');
    return {
      ...actual,
      isPrismaError: jest.fn(),
      isPrismaErrorCode: jest.fn(),
      PRISMA_ERROR_CODE_MAP: {
        P2002: 'RE0003',
        P2025: 'RE0002',
        P1000: 'RE0206',
      },
    };
  },
);

describe('unit RepositoryError', () => {
  describe('constructor', () => {
    it('should create RepositoryError with correct properties', () => {
      const error = new RepositoryError('RE0001', 'Test error');

      expect(error.errorCode).toBe('RE0001');
      expect(error.message).toBe('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RepositoryError);
    });

    it('should create RepositoryError with cause', () => {
      const originalError = new Error('Original error');
      const error = new RepositoryError('RE0001', 'Test error', originalError);

      expect(error.errorCode).toBe('RE0001');
      expect(error.message).toBe('Test error');
      expect(error.cause).toBe(originalError);
    });
  });
});

describe('function canConvertToRepositoryError', () => {
  const mockIsPrismaError = jest.mocked(isPrismaError);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for Prisma errors', () => {
    const error = new PrismaClientKnownRequestError('Test', { code: 'P2002', clientVersion: '1.0.0' });
    mockIsPrismaError.mockReturnValue(true);

    expect(canConvertToRepositoryError(error)).toBe(true);
    expect(mockIsPrismaError).toHaveBeenCalledWith(error);
  });

  it('should return false for non-Prisma errors', () => {
    const error = new Error('Regular error');
    mockIsPrismaError.mockReturnValue(false);

    expect(canConvertToRepositoryError(error)).toBe(false);
    expect(mockIsPrismaError).toHaveBeenCalledWith(error);
  });
});

describe('function buildRepositoryError', () => {
  const mockIsPrismaErrorCode = jest.mocked(isPrismaErrorCode);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when error is PrismaClientKnownRequestError', () => {
    it('should build RepositoryError with known error code', () => {
      mockIsPrismaErrorCode.mockReturnValue(true);
      const prismaError = new PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '1.0.0',
      });

      const result = buildRepositoryError(prismaError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE0003');
      expect(result.message).toBe('Unique constraint failed');
      expect(result.cause).toBe(prismaError);
    });

    it('should build RepositoryError with unknown error code', () => {
      mockIsPrismaErrorCode.mockReturnValue(false);
      const prismaError = new PrismaClientKnownRequestError('Unknown error', { code: 'P9999', clientVersion: '1.0.0' });

      const result = buildRepositoryError(prismaError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE9999');
      expect(result.message).toBe('Unknown error');
      expect(result.cause).toBe(prismaError);
    });

    it('should include meta information in detail', () => {
      mockIsPrismaErrorCode.mockReturnValue(true);
      const prismaError = new PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '1.0.0',
        meta: { target: ['email'] },
      });

      const result = buildRepositoryError(prismaError);

      expect(result.message).toBe('Unique constraint failed: meta: {"target":["email"]}');
    });
  });

  describe('when error is PrismaClientValidationError', () => {
    it('should build RepositoryError for validation error', () => {
      const prismaError = new PrismaClientValidationError('Validation failed', { clientVersion: '1.0.0' });

      const result = buildRepositoryError(prismaError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE0008');
      expect(result.message).toBe('Validation failed');
      expect(result.cause).toBe(prismaError);
    });
  });

  describe('when error is PrismaClientUnknownRequestError', () => {
    it('should build RepositoryError for unknown request error', () => {
      const prismaError = new PrismaClientUnknownRequestError('Unknown request error', { clientVersion: '1.0.0' });

      const result = buildRepositoryError(prismaError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE0208');
      expect(result.message).toBe('Unknown request error');
      expect(result.cause).toBe(prismaError);
    });
  });

  describe('when error is PrismaClientRustPanicError', () => {
    it('should build RepositoryError for rust panic error', () => {
      const prismaError = new PrismaClientRustPanicError('Rust panic', '1.0.0');

      const result = buildRepositoryError(prismaError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE0207');
      expect(result.message).toBe('Rust panic');
      expect(result.cause).toBe(prismaError);
    });
  });

  describe('when error is PrismaClientInitializationError', () => {
    it('should build RepositoryError with known initialization error code', () => {
      mockIsPrismaErrorCode.mockReturnValue(true);
      const prismaError = new PrismaClientInitializationError('Database connection failed', '1.0.0', 'P1000');

      const result = buildRepositoryError(prismaError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE0206');
      expect(result.message).toBe('Database connection failed');
      expect(result.cause).toBe(prismaError);
    });

    it('should build RepositoryError with unknown initialization error code', () => {
      mockIsPrismaErrorCode.mockReturnValue(false);
      const prismaError = new PrismaClientInitializationError('Unknown initialization error', '1.0.0', 'P9999');

      const result = buildRepositoryError(prismaError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE9999');
      expect(result.message).toBe('Unknown initialization error');
      expect(result.cause).toBe(prismaError);
    });

    it('should build RepositoryError with undefined error code', () => {
      const prismaError = new PrismaClientInitializationError('Initialization error without code', '1.0.0');

      const result = buildRepositoryError(prismaError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE9999');
      expect(result.message).toBe('Initialization error without code');
      expect(result.cause).toBe(prismaError);
    });
  });

  describe('unknown error type', () => {
    it('should build RepositoryError for unknown Prisma error', () => {
      const unknownError = { message: 'Unknown error' } as unknown as PrismaError;

      const result = buildRepositoryError(unknownError);

      expect(result).toBeInstanceOf(RepositoryError);
      expect(result.errorCode).toBe('RE9999');
      expect(result.message).toBe('An unknown Prisma error occurred');
      expect(result.cause).toBe(unknownError);
    });
  });
});
