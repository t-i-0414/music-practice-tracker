import { DomainEvent } from '@/domain/shared/domain-event.base';

class TestEvent extends DomainEvent {
  public readonly eventName = 'UserCreated';

  public constructor(aggregateId: string) {
    super(aggregateId);
  }
}

describe('unit DomainEvent', () => {
  it('should set occurredAt to current time', () => {
    expect.assertions(2);

    const before = new Date();
    const event = new TestEvent('agg-123');
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should expose eventName', () => {
    expect.assertions(1);

    const event = new TestEvent('agg-123');

    expect(event.eventName).toBe('UserCreated');
  });

  it('should store aggregateId', () => {
    expect.assertions(1);

    const event = new TestEvent('agg-123');

    expect(event.aggregateId).toBe('agg-123');
  });
});
