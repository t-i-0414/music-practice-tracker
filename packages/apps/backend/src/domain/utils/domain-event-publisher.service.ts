import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { AggregateRoot } from './aggregate-root.base';

@Injectable()
export class DomainEventPublisher {
  public constructor(private readonly eventEmitter: EventEmitter2) {}

  public publishAll(aggregate: AggregateRoot<unknown>): void {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event);
    }
  }
}
