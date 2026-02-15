import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, type HealthCheckResult, MemoryHealthIndicator } from '@nestjs/terminus';

import { Public } from '@/apis/utils/decorators/public.decorator';
import { PrismaHealthIndicator } from '@/apis/utils/health/prisma-health.indicator';

const MEMORY_HEAP_THRESHOLD_MB = 200;
const BYTES_PER_MB = 1_048_576;
const MEMORY_HEAP_THRESHOLD = MEMORY_HEAP_THRESHOLD_MB * BYTES_PER_MB;

@ApiTags('health')
@Controller('health')
export class HealthController {
  public constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  public async check(): Promise<HealthCheckResult> {
    try {
      return await this.health.check([
        () => this.prismaHealth.pingCheck('database'),
        () => this.memory.checkHeap('memory_heap', MEMORY_HEAP_THRESHOLD),
      ]);
    } catch {
      // HealthCheckService throws when any indicator fails.
      // The thrown error does not extend HttpException, so GlobalExceptionFilter
      // would treat it as UN9999 (500). Convert to 503 for correct HTTP semantics.
      // eslint-disable-next-line custom-backend-eslint/throw-new-common-error-only -- health checks are infrastructure concerns; ServiceUnavailableException is the correct HTTP status
      throw new ServiceUnavailableException('Service Unavailable');
    }
  }
}
