import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import type { UserCreatedEvent } from '../events/user-created.event';
import type { UserDeletedEvent } from '../events/user-deleted.event';

import { Metrics } from '@/utils/metrics/dogstatsd.metrics';

@Injectable()
export class UserMetricsHandler {
  @OnEvent('user.created')
  public handleUserCreated(_event: UserCreatedEvent): void {
    Metrics.incrementUserCreated();
  }

  @OnEvent('user.deleted')
  public handleUserDeleted(_event: UserDeletedEvent): void {
    Metrics.incrementUserDeleted();
  }
}
