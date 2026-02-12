import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, type HealthCheckResult, MemoryHealthIndicator } from '@nestjs/terminus';

import { Public } from '@/apis/utils/decorators/public.decorator';
import { PrismaHealthIndicator } from '@/apis/utils/health/prisma-health.indicator';

const MEMORY_HEAP_THRESHOLD_MB = 200;
const BYTES_PER_KB = 1024;
const KB_PER_MB = 1024;
const MEMORY_HEAP_THRESHOLD = MEMORY_HEAP_THRESHOLD_MB * BYTES_PER_KB * KB_PER_MB;

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
  public check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', MEMORY_HEAP_THRESHOLD),
    ]);
  }
}
