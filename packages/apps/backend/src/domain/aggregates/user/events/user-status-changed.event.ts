import { DomainEvent } from '@/domain/utils/domain-event.base';

export const USER_STATUS_CHANGED_EVENT = 'user.status_changed' as const;

export class UserStatusChangedEvent extends DomainEvent {
  public readonly eventName = USER_STATUS_CHANGED_EVENT;

  public constructor(
    aggregateId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
  ) {
    super(aggregateId);
  }
}
