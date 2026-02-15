import { Logger } from '@nestjs/common';

import { PrismaHealthIndicator } from '@/apis/utils/health/prisma-health.indicator';
import { RepositoryService } from '@/repository/repository.service';

const mockUp = jest.fn().mockReturnValue({ database: { status: 'up' } });
const mockDown = jest.fn().mockReturnValue({ database: { status: 'down', message: 'Database unreachable' } });
const mockCheck = jest.fn().mockReturnValue({ up: mockUp, down: mockDown });

const mockHealthIndicatorService = { check: mockCheck };

describe('unit PrismaHealthIndicator', () => {
  let indicator: PrismaHealthIndicator;
  let mockRepository: { $queryRaw: jest.Mock };
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockUp.mockClear();
    mockDown.mockClear();
    mockCheck.mockClear().mockReturnValue({ up: mockUp, down: mockDown });

    mockRepository = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    indicator = new PrismaHealthIndicator(
      mockHealthIndicatorService as never,
      mockRepository as unknown as RepositoryService,
    );

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('should return healthy status when database is reachable', async () => {
    expect.hasAssertions();

    const result = await indicator.pingCheck('database');

    expect(result).toStrictEqual({ database: { status: 'up' } });
    expect(mockRepository.$queryRaw).toHaveBeenCalledWith(['SELECT 1']);
  });

  it('should throw down result when database is unreachable', async () => {
    expect.hasAssertions();

    mockRepository.$queryRaw.mockRejectedValue(new Error('Connection refused'));

    await expect(indicator.pingCheck('database')).rejects.toStrictEqual({
      database: { status: 'down', message: 'Database unreachable' },
    });
  });

  it('should log original error when database check fails', async () => {
    expect.hasAssertions();

    const dbError = new Error('Connection refused');
    mockRepository.$queryRaw.mockRejectedValue(dbError);

    await expect(indicator.pingCheck('database')).rejects.toStrictEqual({
      database: { status: 'down', message: 'Database unreachable' },
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Database health check failed',
      expect.stringContaining('Connection refused'),
    );
  });

  it('should use the provided key in the health check session', async () => {
    expect.hasAssertions();

    await indicator.pingCheck('custom_db');

    expect(mockCheck).toHaveBeenCalledWith('custom_db');
  });
});
