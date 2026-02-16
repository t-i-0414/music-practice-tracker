import { DomainEvent } from '@/domain/utils/domain-event.base';

export class UserDeletedEvent extends DomainEvent {
  public readonly eventName = 'user.deleted';

  public constructor(aggregateId: string) {
    super(aggregateId);
  }
}
