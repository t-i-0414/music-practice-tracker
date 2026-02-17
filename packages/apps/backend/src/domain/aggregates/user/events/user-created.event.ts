import { DomainEvent } from '@/domain/utils/domain-event.base';

export const USER_CREATED_EVENT = 'user.created' as const;

export class UserCreatedEvent extends DomainEvent {
  public readonly eventName = USER_CREATED_EVENT;

  public constructor(
    aggregateId: string,
    public readonly name: string,
    public readonly firebaseUid: string,
  ) {
    super(aggregateId);
  }
}
