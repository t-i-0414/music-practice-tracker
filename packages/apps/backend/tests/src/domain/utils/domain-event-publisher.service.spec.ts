import { EventEmitter2 } from '@nestjs/event-emitter';

import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';

class FakeAggregate {
  private _events: { eventName: string }[] = [];

  public addEvent(eventName: string): void {
    this._events.push({ eventName });
  }

  public pullDomainEvents(): { eventName: string }[] {
    const events = [...this._events];
    this._events = [];
    return events;
  }

  public get domainEvents(): readonly { eventName: string }[] {
    return this._events;
  }
}

describe('unit DomainEventPublisher', () => {
  let publisher: DomainEventPublisher;
  let emitter: jest.Mocked<Pick<EventEmitter2, 'emit'>>;

  beforeEach(() => {
    emitter = { emit: jest.fn().mockReturnValue(true) };
    publisher = new DomainEventPublisher(emitter as unknown as EventEmitter2);
  });

  it('should pull events from aggregate and emit each', () => {
    expect.assertions(3);

    const aggregate = new FakeAggregate();
    aggregate.addEvent('user.created');
    aggregate.addEvent('user.deleted');

    publisher.publishAll(aggregate as unknown as Parameters<DomainEventPublisher['publishAll']>[0]);

    expect(emitter.emit).toHaveBeenCalledTimes(2);
    expect(emitter.emit).toHaveBeenCalledWith('user.created', { eventName: 'user.created' });
    expect(emitter.emit).toHaveBeenCalledWith('user.deleted', { eventName: 'user.deleted' });
  });

  it('should not emit if aggregate has no events', () => {
    expect.assertions(1);

    const aggregate = new FakeAggregate();

    publisher.publishAll(aggregate as unknown as Parameters<DomainEventPublisher['publishAll']>[0]);

    expect(emitter.emit).not.toHaveBeenCalled();
  });

  it('should clear aggregate events after publish', () => {
    expect.assertions(1);

    const aggregate = new FakeAggregate();
    aggregate.addEvent('user.created');

    publisher.publishAll(aggregate as unknown as Parameters<DomainEventPublisher['publishAll']>[0]);

    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
