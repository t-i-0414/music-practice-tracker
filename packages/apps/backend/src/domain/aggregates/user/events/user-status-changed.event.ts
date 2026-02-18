import { DomainEvent } from '@/domain/utils/domain-event.base';
import type { UserStatusValue } from '@/domain/utils/value-objects/user-status.vo';

export const USER_STATUS_CHANGED_EVENT = 'user.status_changed' as const;

export class UserStatusChangedEvent extends DomainEvent {
  public readonly eventName = USER_STATUS_CHANGED_EVENT;

  public constructor(
    aggregateId: string,
    public readonly oldStatus: UserStatusValue,
    public readonly newStatus: UserStatusValue,
  ) {
    super(aggregateId);
  }
}
