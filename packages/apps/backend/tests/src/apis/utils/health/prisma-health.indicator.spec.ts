import { PrismaHealthIndicator } from '@/apis/utils/health/prisma-health.indicator';
import { RepositoryService } from '@/repository/repository.service';

const mockUp = jest.fn().mockReturnValue({ database: { status: 'up' } });
const mockDown = jest.fn().mockReturnValue({ database: { status: 'down', message: 'Database unreachable' } });
const mockCheck = jest.fn().mockReturnValue({ up: mockUp, down: mockDown });

const mockHealthIndicatorService = { check: mockCheck };

describe('unit PrismaHealthIndicator', () => {
  let indicator: PrismaHealthIndicator;
  let mockRepository: { $queryRawUnsafe: jest.Mock };

  beforeEach(() => {
    mockUp.mockClear();
    mockDown.mockClear();
    mockCheck.mockClear().mockReturnValue({ up: mockUp, down: mockDown });

    mockRepository = {
      $queryRawUnsafe: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    indicator = new PrismaHealthIndicator(
      mockHealthIndicatorService as never,
      mockRepository as unknown as RepositoryService,
    );
  });

  it('should return healthy status when database is reachable', async () => {
    expect.hasAssertions();

    const result = await indicator.pingCheck('database');

    expect(result).toStrictEqual({ database: { status: 'up' } });
    expect(mockRepository.$queryRawUnsafe).toHaveBeenCalledWith('SELECT 1');
  });

  it('should throw down result when database is unreachable', async () => {
    expect.hasAssertions();

    mockRepository.$queryRawUnsafe.mockRejectedValue(new Error('Connection refused'));

    await expect(indicator.pingCheck('database')).rejects.toStrictEqual({
      database: { status: 'down', message: 'Database unreachable' },
    });
  });

  it('should use the provided key in the health check session', async () => {
    expect.hasAssertions();

    await indicator.pingCheck('custom_db');

    expect(mockCheck).toHaveBeenCalledWith('custom_db');
  });
});
