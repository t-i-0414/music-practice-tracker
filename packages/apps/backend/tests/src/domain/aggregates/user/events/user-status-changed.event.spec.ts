import {
  USER_STATUS_CHANGED_EVENT,
  UserStatusChangedEvent,
} from '@/domain/aggregates/user/events/user-status-changed.event';

describe('unit UserStatusChangedEvent', () => {
  it('should set eventName to the USER_STATUS_CHANGED_EVENT constant', () => {
    expect.assertions(2);

    const event = new UserStatusChangedEvent('agg-123', 'ACTIVE', 'SUSPENDED');

    expect(event.eventName).toBe('user.status_changed');
    expect(event.eventName).toBe(USER_STATUS_CHANGED_EVENT);
  });

  it('should store aggregateId', () => {
    expect.assertions(1);

    const event = new UserStatusChangedEvent('agg-123', 'ACTIVE', 'SUSPENDED');

    expect(event.aggregateId).toBe('agg-123');
  });

  it('should store oldStatus and newStatus', () => {
    expect.assertions(2);

    const event = new UserStatusChangedEvent('agg-123', 'ACTIVE', 'SUSPENDED');

    expect(event.oldStatus).toBe('ACTIVE');
    expect(event.newStatus).toBe('SUSPENDED');
  });

  it('should set occurredAt to current time', () => {
    expect.assertions(2);

    const before = new Date();
    const event = new UserStatusChangedEvent('agg-123', 'ACTIVE', 'SUSPENDED');
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
