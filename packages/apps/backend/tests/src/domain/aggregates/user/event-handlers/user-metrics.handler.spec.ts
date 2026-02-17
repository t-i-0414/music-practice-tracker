import { Logger } from '@nestjs/common';

import { UserMetricsHandler } from '@/domain/aggregates/user/event-handlers/user-metrics.handler';
import { UserCreatedEvent } from '@/domain/aggregates/user/events/user-created.event';
import { UserDeletedEvent } from '@/domain/aggregates/user/events/user-deleted.event';
import { UserNameChangedEvent } from '@/domain/aggregates/user/events/user-name-changed.event';
import { UserStatusChangedEvent } from '@/domain/aggregates/user/events/user-status-changed.event';
import { Metrics } from '@/utils/metrics/dogstatsd.metrics';

describe('unit UserMetricsHandler', () => {
  let handler: UserMetricsHandler;

  beforeEach(() => {
    handler = new UserMetricsHandler();
    jest.spyOn(Metrics, 'incrementUserCreated').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserDeleted').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserNameChanged').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserStatusChanged').mockReturnValue(undefined);
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

  it('should call Metrics.incrementUserNameChanged on user.name_changed event', () => {
    expect.assertions(1);

    const event = new UserNameChangedEvent('agg-123', 'OldName', 'NewName');

    handler.handleUserNameChanged(event);

    expect(Metrics.incrementUserNameChanged).toHaveBeenCalledTimes(1);
  });

  it('should call Metrics.incrementUserStatusChanged on user.status_changed event', () => {
    expect.assertions(1);

    const event = new UserStatusChangedEvent('agg-123', 'ACTIVE', 'SUSPENDED');

    handler.handleUserStatusChanged(event);

    expect(Metrics.incrementUserStatusChanged).toHaveBeenCalledTimes(1);
  });

  it('should catch and log error with aggregateId when incrementUserCreated throws', () => {
    expect.assertions(3);

    const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserCreated').mockImplementation(() => {
      throw new Error('metrics failure');
    });

    const event = new UserCreatedEvent('agg-123', 'Takuya', 'firebase-uid-1');

    expect(() => {
      handler.handleUserCreated(event);
    }).not.toThrow();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('metrics failure'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('agg-123'));
  });

  it('should catch and log error with aggregateId when incrementUserDeleted throws', () => {
    expect.assertions(3);

    const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserDeleted').mockImplementation(() => {
      throw new Error('metrics failure');
    });

    const event = new UserDeletedEvent('agg-456');

    expect(() => {
      handler.handleUserDeleted(event);
    }).not.toThrow();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('metrics failure'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('agg-456'));
  });

  it('should catch and log error with aggregateId when incrementUserNameChanged throws', () => {
    expect.assertions(3);

    const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserNameChanged').mockImplementation(() => {
      throw new Error('metrics failure');
    });

    const event = new UserNameChangedEvent('agg-789', 'OldName', 'NewName');

    expect(() => {
      handler.handleUserNameChanged(event);
    }).not.toThrow();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('metrics failure'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('agg-789'));
  });

  it('should catch and log error with aggregateId when incrementUserStatusChanged throws', () => {
    expect.assertions(3);

    const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    jest.spyOn(Metrics, 'incrementUserStatusChanged').mockImplementation(() => {
      throw new Error('metrics failure');
    });

    const event = new UserStatusChangedEvent('agg-101', 'ACTIVE', 'BANNED');

    expect(() => {
      handler.handleUserStatusChanged(event);
    }).not.toThrow();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('metrics failure'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('agg-101'));
  });
});
