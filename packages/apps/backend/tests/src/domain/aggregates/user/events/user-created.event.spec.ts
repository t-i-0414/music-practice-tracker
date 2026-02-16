import { UserCreatedEvent } from '@/domain/aggregates/user/events/user-created.event';

describe('unit UserCreatedEvent', () => {
  it('should set eventName to user.created', () => {
    expect.assertions(1);

    const event = new UserCreatedEvent('agg-123', 'Takuya', 'firebase-uid-1');

    expect(event.eventName).toBe('user.created');
  });

  it('should store aggregateId', () => {
    expect.assertions(1);

    const event = new UserCreatedEvent('agg-123', 'Takuya', 'firebase-uid-1');

    expect(event.aggregateId).toBe('agg-123');
  });

  it('should store name and firebaseUid', () => {
    expect.assertions(2);

    const event = new UserCreatedEvent('agg-123', 'Takuya', 'firebase-uid-1');

    expect(event.name).toBe('Takuya');
    expect(event.firebaseUid).toBe('firebase-uid-1');
  });

  it('should set occurredAt to current time', () => {
    expect.assertions(2);

    const before = new Date();
    const event = new UserCreatedEvent('agg-123', 'Takuya', 'firebase-uid-1');
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
