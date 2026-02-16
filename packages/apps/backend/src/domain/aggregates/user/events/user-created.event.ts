import { DomainEvent } from '@/domain/utils/domain-event.base';

export class UserCreatedEvent extends DomainEvent {
  public readonly eventName = 'user.created';

  public constructor(
    aggregateId: string,
    public readonly name: string,
    public readonly firebaseUid: string,
  ) {
    super(aggregateId);
  }
}
