import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { AggregateRoot } from './aggregate-root.base';

@Injectable()
export class DomainEventPublisher {
  private readonly logger = new Logger(DomainEventPublisher.name);

  public constructor(private readonly eventEmitter: EventEmitter2) {}

  public publishAll(aggregate: AggregateRoot<unknown>): void {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      try {
        this.eventEmitter.emit(event.eventName, event);
      } catch (error: unknown) {
        this.logger.error(
          `Failed to publish domain event: ${event.eventName} (aggregateId=${event.aggregateId})`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
