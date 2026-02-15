import { Injectable, Logger } from '@nestjs/common';
import { type HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';

import { RepositoryService } from '@/repository/repository.service';

@Injectable()
export class PrismaHealthIndicator {
  private readonly logger = new Logger(PrismaHealthIndicator.name);

  public constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly repository: RepositoryService,
  ) {}

  public async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const session = this.healthIndicatorService.check(key);
    try {
      // eslint-disable-next-line custom-backend-eslint/repository-model-access-restriction -- health check is an infrastructure concern, not a domain aggregate
      await this.repository.$queryRaw`SELECT 1`;
      return session.up();
    } catch (error: unknown) {
      this.logger.error('Database health check failed', error instanceof Error ? error.stack : String(error));
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- @nestjs/terminus HealthIndicatorService.down() returns a non-Error result by design
      throw session.down({ message: 'Database unreachable' });
    }
  }
}
