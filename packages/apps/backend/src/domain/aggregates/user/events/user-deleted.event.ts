import { DomainEvent } from '@/domain/utils/domain-event.base';

export const USER_DELETED_EVENT = 'user.deleted' as const;

export class UserDeletedEvent extends DomainEvent {
  public readonly eventName = USER_DELETED_EVENT;

  public constructor(aggregateId: string) {
    super(aggregateId);
  }
}
