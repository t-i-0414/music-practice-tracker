import { AggregateRoot } from '@/domain/utils/aggregate-root.base';
import { DomainEvent } from '@/domain/utils/domain-event.base';

class TestEvent extends DomainEvent {
  public readonly eventName = 'TestEvent';

  public constructor(aggregateId: string) {
    super(aggregateId);
  }
}

class TestAggregate extends AggregateRoot<{ value: string }> {
  public constructor(publicId: string, value: string) {
    super(publicId, { value });
  }

  public doSomething(): void {
    this.addDomainEvent(new TestEvent(this.publicId));
  }
}

describe('unit AggregateRoot', () => {
  describe('domainEvents', () => {
    it('should start with no domain events', () => {
      expect.assertions(1);

      const aggregate = new TestAggregate('abc-123', 'test');

      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it('should accumulate domain events', () => {
      expect.assertions(2);

      const aggregate = new TestAggregate('abc-123', 'test');
      aggregate.doSomething();
      aggregate.doSomething();

      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.domainEvents[0]).toBeInstanceOf(TestEvent);
    });

    it('should store aggregateId in events', () => {
      expect.assertions(1);

      const aggregate = new TestAggregate('abc-123', 'test');
      aggregate.doSomething();

      expect(aggregate.domainEvents[0]?.aggregateId).toBe('abc-123');
    });
  });

  describe('pullDomainEvents', () => {
    it('should return and clear domain events', () => {
      expect.assertions(3);

      const aggregate = new TestAggregate('abc-123', 'test');
      aggregate.doSomething();
      aggregate.doSomething();

      const events = aggregate.pullDomainEvents();

      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(TestEvent);
      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it('should return empty array on second pull (no double-dispatch)', () => {
      expect.assertions(1);

      const aggregate = new TestAggregate('abc-123', 'test');
      aggregate.doSomething();
      aggregate.pullDomainEvents();

      const secondPull = aggregate.pullDomainEvents();

      expect(secondPull).toHaveLength(0);
    });

    it('should return a detached copy not affected by subsequent events', () => {
      expect.assertions(2);

      const aggregate = new TestAggregate('abc-123', 'test');
      aggregate.doSomething();

      const pulled = aggregate.pullDomainEvents();
      aggregate.doSomething();

      expect(pulled).toHaveLength(1);
      expect(aggregate.domainEvents).toHaveLength(1);
    });
  });

  describe('equals (inherited from Entity)', () => {
    it('should compare by publicId', () => {
      expect.assertions(2);

      const agg1 = new TestAggregate('abc-123', 'value1');
      const agg2 = new TestAggregate('abc-123', 'value2');
      const agg3 = new TestAggregate('def-456', 'value1');

      expect(agg1.equals(agg2)).toBe(true);
      expect(agg1.equals(agg3)).toBe(false);
    });
  });
});
