import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { AggregateRoot } from './aggregate-root.base';

@Injectable()
export class DomainEventPublisher {
  private readonly logger = new Logger(DomainEventPublisher.name);

  public constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Publish all pending domain events from the aggregate using synchronous
   * fire-and-forget semantics. Event handler failures are caught and logged
   * but never propagate to callers. Events are pulled (consumed) from the
   * aggregate, so calling this method twice yields no duplicate emissions.
   */
  public publishAll(aggregate: AggregateRoot<unknown>): void {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      try {
        this.eventEmitter.emit(event.eventName, event);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        this.logger.error(
          `Failed to publish domain event: ${event.eventName} (aggregateId=${event.aggregateId}): ${message}`,
          stack,
        );
      }
    }
  }
}
