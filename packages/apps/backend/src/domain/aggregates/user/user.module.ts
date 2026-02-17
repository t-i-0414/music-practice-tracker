import { Module } from '@nestjs/common';

import { UserMetricsHandler } from './event-handlers/user-metrics.handler';
import { UserCommandService } from './user.command.service';
import { UserQueryService } from './user.query.service';

import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { RepositoryModule } from '@/repository/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [UserQueryService, UserCommandService, DomainEventPublisher, UserMetricsHandler],
  exports: [UserQueryService, UserCommandService, DomainEventPublisher],
})
export class UserModule {}
