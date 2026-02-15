import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';

import { RepositoryModule } from '@/repository/repository.module';

@Module({
  imports: [TerminusModule, RepositoryModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
