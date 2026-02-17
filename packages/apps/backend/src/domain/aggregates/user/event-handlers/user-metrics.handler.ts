import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { USER_CREATED_EVENT } from '../events/user-created.event';
import type { UserCreatedEvent } from '../events/user-created.event';
import { USER_DELETED_EVENT } from '../events/user-deleted.event';
import type { UserDeletedEvent } from '../events/user-deleted.event';

import { Metrics } from '@/utils/metrics/dogstatsd.metrics';

@Injectable()
export class UserMetricsHandler {
  private readonly logger = new Logger(UserMetricsHandler.name);

  @OnEvent(USER_CREATED_EVENT)
  public handleUserCreated(event: UserCreatedEvent): void {
    try {
      Metrics.incrementUserCreated();
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to record ${USER_CREATED_EVENT} metric (aggregateId=${event.aggregateId}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @OnEvent(USER_DELETED_EVENT)
  public handleUserDeleted(event: UserDeletedEvent): void {
    try {
      Metrics.incrementUserDeleted();
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to record ${USER_DELETED_EVENT} metric (aggregateId=${event.aggregateId}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
