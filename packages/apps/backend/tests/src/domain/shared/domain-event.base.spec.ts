import { DomainEvent } from '@/domain/shared/domain-event.base';

class TestEvent extends DomainEvent {
  public readonly eventName = 'UserCreated';

  public constructor() {
    super();
  }
}

describe('unit DomainEvent', () => {
  it('should set occurredAt to current time', () => {
    expect.assertions(1);

    const before = new Date();
    const event = new TestEvent();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should expose eventName', () => {
    expect.assertions(1);

    const event = new TestEvent();

    expect(event.eventName).toBe('UserCreated');
  });
});
