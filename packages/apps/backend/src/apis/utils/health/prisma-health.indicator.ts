import { Injectable } from '@nestjs/common';
import { type HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';

import { RepositoryService } from '@/repository/repository.service';

@Injectable()
export class PrismaHealthIndicator {
  public constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly repository: RepositoryService,
  ) {}

  public async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const session = this.healthIndicatorService.check(key);
    try {
      await this.repository.$queryRawUnsafe('SELECT 1');
      return session.up();
    } catch {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- @nestjs/terminus HealthIndicatorService.down() returns a non-Error result by design
      throw session.down({ message: 'Database unreachable' });
    }
  }
}
