import { Logger } from '@nestjs/common';

import { UserMetricsHandler } from '@/domain/aggregates/user/event-handlers/user-metrics.handler';
import { UserCreatedEvent } from '@/domain/aggregates/user/events/user-created.event';
import { UserDeletedEvent } from '@/domain/aggregates/user/events/user-deleted.event';
import { Metrics } from '@/utils/metrics/dogstatsd.metrics';

describe('unit UserMetricsHandler', () => {
  let handler: UserMetricsHandler;

  beforeEach(() => {
    handler = new UserMetricsHandler();
    jest.spyOn(Metrics, 'incrementUserCreated').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserDeleted').mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call Metrics.incrementUserCreated on user.created event', () => {
    expect.assertions(1);

    const event = new UserCreatedEvent('agg-123', 'Takuya', 'firebase-uid-1');

    handler.handleUserCreated(event);

    expect(Metrics.incrementUserCreated).toHaveBeenCalledTimes(1);
  });

  it('should call Metrics.incrementUserDeleted on user.deleted event', () => {
    expect.assertions(1);

    const event = new UserDeletedEvent('agg-123');

    handler.handleUserDeleted(event);

    expect(Metrics.incrementUserDeleted).toHaveBeenCalledTimes(1);
  });

  it('should catch and log error when incrementUserCreated throws', () => {
    expect.assertions(2);

    const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserCreated').mockImplementation(() => {
      throw new Error('metrics failure');
    });

    const event = new UserCreatedEvent('agg-123', 'Takuya', 'firebase-uid-1');

    expect(() => {
      handler.handleUserCreated(event);
    }).not.toThrow();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('metrics failure'));
  });

  it('should catch and log error when incrementUserDeleted throws', () => {
    expect.assertions(2);

    const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserDeleted').mockImplementation(() => {
      throw new Error('metrics failure');
    });

    const event = new UserDeletedEvent('agg-123');

    expect(() => {
      handler.handleUserDeleted(event);
    }).not.toThrow();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('metrics failure'));
  });
});
