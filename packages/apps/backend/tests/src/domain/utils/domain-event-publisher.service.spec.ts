import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';

class FakeAggregate {
  private _events: { eventName: string; aggregateId: string }[] = [];

  public addEvent(eventName: string, aggregateId = 'agg-1'): void {
    this._events.push({ eventName, aggregateId });
  }

  public pullDomainEvents(): { eventName: string; aggregateId: string }[] {
    const events = [...this._events];
    this._events = [];
    return events;
  }

  public get domainEvents(): readonly { eventName: string; aggregateId: string }[] {
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should pull events from aggregate and emit each', () => {
    expect.assertions(3);

    const aggregate = new FakeAggregate();
    aggregate.addEvent('user.created');
    aggregate.addEvent('user.deleted');

    publisher.publishAll(aggregate as unknown as Parameters<DomainEventPublisher['publishAll']>[0]);

    expect(emitter.emit).toHaveBeenCalledTimes(2);
    expect(emitter.emit).toHaveBeenCalledWith('user.created', { eventName: 'user.created', aggregateId: 'agg-1' });
    expect(emitter.emit).toHaveBeenCalledWith('user.deleted', { eventName: 'user.deleted', aggregateId: 'agg-1' });
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

  it('should catch handler errors and continue emitting remaining events', () => {
    expect.assertions(2);

    emitter.emit.mockImplementationOnce(() => {
      throw new Error('handler failure');
    });
    emitter.emit.mockReturnValueOnce(true);

    const aggregate = new FakeAggregate();
    aggregate.addEvent('event.first');
    aggregate.addEvent('event.second');

    publisher.publishAll(aggregate as unknown as Parameters<DomainEventPublisher['publishAll']>[0]);

    expect(emitter.emit).toHaveBeenCalledTimes(2);
    expect(emitter.emit).toHaveBeenCalledWith('event.second', { eventName: 'event.second', aggregateId: 'agg-1' });
  });

  it('should log error when emit throws', () => {
    expect.assertions(1);

    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockReturnValue(undefined);
    emitter.emit.mockImplementationOnce(() => {
      throw new Error('handler failure');
    });

    const aggregate = new FakeAggregate();
    aggregate.addEvent('user.created', 'agg-123');

    publisher.publishAll(aggregate as unknown as Parameters<DomainEventPublisher['publishAll']>[0]);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Failed to publish domain event: user.created (aggregateId=agg-123)',
      expect.any(String),
    );
  });
});
