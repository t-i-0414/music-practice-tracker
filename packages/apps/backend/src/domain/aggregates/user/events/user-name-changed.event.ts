import { DomainEvent } from '@/domain/utils/domain-event.base';

export const USER_NAME_CHANGED_EVENT = 'user.name_changed' as const;

export class UserNameChangedEvent extends DomainEvent {
  public readonly eventName = USER_NAME_CHANGED_EVENT;

  public constructor(
    aggregateId: string,
    public readonly oldName: string,
    public readonly newName: string,
  ) {
    super(aggregateId);
  }
}
