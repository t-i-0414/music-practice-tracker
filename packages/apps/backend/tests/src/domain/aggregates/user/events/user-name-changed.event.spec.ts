import { USER_NAME_CHANGED_EVENT, UserNameChangedEvent } from '@/domain/aggregates/user/events/user-name-changed.event';

describe('unit UserNameChangedEvent', () => {
  it('should set eventName to the USER_NAME_CHANGED_EVENT constant', () => {
    expect.assertions(2);

    const event = new UserNameChangedEvent('agg-123', 'OldName', 'NewName');

    expect(event.eventName).toBe('user.name_changed');
    expect(event.eventName).toBe(USER_NAME_CHANGED_EVENT);
  });

  it('should store aggregateId', () => {
    expect.assertions(1);

    const event = new UserNameChangedEvent('agg-123', 'OldName', 'NewName');

    expect(event.aggregateId).toBe('agg-123');
  });

  it('should store oldName and newName', () => {
    expect.assertions(2);

    const event = new UserNameChangedEvent('agg-123', 'OldName', 'NewName');

    expect(event.oldName).toBe('OldName');
    expect(event.newName).toBe('NewName');
  });

  it('should set occurredAt to current time', () => {
    expect.assertions(2);

    const before = new Date();
    const event = new UserNameChangedEvent('agg-123', 'OldName', 'NewName');
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
