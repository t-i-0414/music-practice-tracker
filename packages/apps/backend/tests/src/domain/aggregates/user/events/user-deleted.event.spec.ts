import { UserDeletedEvent } from '@/domain/aggregates/user/events/user-deleted.event';

describe('unit UserDeletedEvent', () => {
  it('should set eventName to user.deleted', () => {
    expect.assertions(1);

    const event = new UserDeletedEvent('agg-123');

    expect(event.eventName).toBe('user.deleted');
  });

  it('should store aggregateId', () => {
    expect.assertions(1);

    const event = new UserDeletedEvent('agg-123');

    expect(event.aggregateId).toBe('agg-123');
  });

  it('should set occurredAt to current time', () => {
    expect.assertions(2);

    const before = new Date();
    const event = new UserDeletedEvent('agg-123');
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
