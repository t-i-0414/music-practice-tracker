import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';

import { HealthController } from '@/apis/utils/health/health.controller';
import { PrismaHealthIndicator } from '@/apis/utils/health/prisma-health.indicator';

describe('unit HealthController', () => {
  let controller: HealthController;
  let mockHealthCheckService: { check: jest.Mock };
  let mockPrismaHealth: { pingCheck: jest.Mock };
  let mockMemory: { checkHeap: jest.Mock };

  beforeEach(() => {
    mockPrismaHealth = {
      pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
    };

    mockMemory = {
      checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
    };

    mockHealthCheckService = {
      check: jest.fn().mockImplementation(async (indicators: (() => Promise<unknown>)[]) => {
        const results = await Promise.all(indicators.map((fn) => fn()));
        return {
          status: 'ok',
          info: Object.assign({}, ...results),
        };
      }),
    };

    controller = new HealthController(
      mockHealthCheckService as unknown as HealthCheckService,
      mockPrismaHealth as unknown as PrismaHealthIndicator,
      mockMemory as unknown as MemoryHealthIndicator,
    );
  });

  it('should return healthy status when all checks pass', async () => {
    expect.hasAssertions();

    const result = await controller.check();

    expect(result).toStrictEqual({
      status: 'ok',
      info: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
      },
    });
  });

  it('should call health check service with both indicators', async () => {
    expect.hasAssertions();

    await controller.check();

    expect(mockHealthCheckService.check).toHaveBeenCalledWith([expect.any(Function), expect.any(Function)]);
  });

  it('should check database via PrismaHealthIndicator', async () => {
    expect.hasAssertions();

    await controller.check();

    expect(mockPrismaHealth.pingCheck).toHaveBeenCalledWith('database');
  });

  it('should check memory heap with 200MB threshold', async () => {
    expect.hasAssertions();

    await controller.check();

    const expectedThreshold = 200 * 1024 * 1024;

    expect(mockMemory.checkHeap).toHaveBeenCalledWith('memory_heap', expectedThreshold);
  });
});
