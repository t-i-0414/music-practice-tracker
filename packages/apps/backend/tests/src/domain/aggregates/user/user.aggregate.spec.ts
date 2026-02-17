import type { UserCreatedEvent } from '@/domain/aggregates/user/events/user-created.event';
import type { UserNameChangedEvent } from '@/domain/aggregates/user/events/user-name-changed.event';
import type { UserStatusChangedEvent } from '@/domain/aggregates/user/events/user-status-changed.event';
import { UserAggregate } from '@/domain/aggregates/user/user.aggregate';
import { DomainError } from '@/domain/utils/domain.error';

const validUuid = '123e4567-e89b-12d3-a456-426614174000';

describe('unit UserAggregate', () => {
  describe('create', () => {
    it('should create aggregate with valid params', () => {
      expect.assertions(3);

      const aggregate = UserAggregate.create({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
      });

      expect(aggregate.publicId).toBe(validUuid);
      expect(aggregate.name.value).toBe('Takuya');
      expect(aggregate.firebaseUid).toBe('firebase-uid-1');
    });

    it('should set status to ACTIVE by default', () => {
      expect.assertions(1);

      const aggregate = UserAggregate.create({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
      });

      expect(aggregate.status.value).toBe('ACTIVE');
    });

    it('should add UserCreatedEvent with correct payload on creation', () => {
      expect.assertions(4);

      const aggregate = UserAggregate.create({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
      });

      const events = aggregate.pullDomainEvents();
      const event = events[0] as UserCreatedEvent;

      expect(events).toHaveLength(1);
      expect(event.eventName).toBe('user.created');
      expect(event.aggregateId).toBe(validUuid);
      expect(event.name).toBe('Takuya');
    });

    it('should throw DomainError for invalid publicId', () => {
      expect.assertions(1);

      expect(() =>
        UserAggregate.create({
          publicId: 'not-a-uuid',
          name: 'Takuya',
          firebaseUid: 'firebase-uid-1',
        }),
      ).toThrow(DomainError);
    });

    it('should throw DomainError for invalid name', () => {
      expect.assertions(1);

      expect(() =>
        UserAggregate.create({
          publicId: validUuid,
          name: '',
          firebaseUid: 'firebase-uid-1',
        }),
      ).toThrow(DomainError);
    });
  });

  describe('fromPersistence', () => {
    it('should reconstitute without domain events', () => {
      expect.assertions(2);

      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'ACTIVE',
      });

      expect(aggregate.name.value).toBe('Takuya');
      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it('should preserve all properties', () => {
      expect.assertions(4);

      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'SUSPENDED',
      });

      expect(aggregate.publicId).toBe(validUuid);
      expect(aggregate.name.value).toBe('Takuya');
      expect(aggregate.firebaseUid).toBe('firebase-uid-1');
      expect(aggregate.status.value).toBe('SUSPENDED');
    });
  });

  describe('markAsCreated', () => {
    it('should add UserCreatedEvent with correct data', () => {
      expect.assertions(3);

      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'ACTIVE',
      });
      aggregate.markAsCreated();

      const events = aggregate.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('user.created');
      expect(events[0].aggregateId).toBe(validUuid);
    });
  });

  describe('markAsDeleted', () => {
    it('should add UserDeletedEvent', () => {
      expect.assertions(3);

      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'ACTIVE',
      });
      aggregate.markAsDeleted();

      const events = aggregate.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('user.deleted');
      expect(events[0].aggregateId).toBe(validUuid);
    });
  });

  describe('changeName', () => {
    it('should update the name', () => {
      expect.assertions(1);

      const { UserName } = jest.requireActual<typeof import('@/domain/utils/value-objects/user-name.vo')>(
        '@/domain/utils/value-objects/user-name.vo',
      );
      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'ACTIVE',
      });

      aggregate.changeName(UserName.create('Alice'));

      expect(aggregate.name.value).toBe('Alice');
    });

    it('should emit UserNameChangedEvent with oldName and newName', () => {
      expect.assertions(4);

      const { UserName } = jest.requireActual<typeof import('@/domain/utils/value-objects/user-name.vo')>(
        '@/domain/utils/value-objects/user-name.vo',
      );
      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'ACTIVE',
      });

      aggregate.changeName(UserName.create('Alice'));

      const events = aggregate.pullDomainEvents();
      const event = events[0] as UserNameChangedEvent;

      expect(events).toHaveLength(1);
      expect(event.eventName).toBe('user.name_changed');
      expect(event.oldName).toBe('Takuya');
      expect(event.newName).toBe('Alice');
    });
  });

  describe('changeStatus', () => {
    it('should update status for valid transition', () => {
      expect.assertions(1);

      const { UserStatus } = jest.requireActual<typeof import('@/domain/utils/value-objects/user-status.vo')>(
        '@/domain/utils/value-objects/user-status.vo',
      );
      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'ACTIVE',
      });

      aggregate.changeStatus(UserStatus.create('SUSPENDED'));

      expect(aggregate.status.value).toBe('SUSPENDED');
    });

    it('should emit UserStatusChangedEvent with oldStatus and newStatus', () => {
      expect.assertions(4);

      const { UserStatus } = jest.requireActual<typeof import('@/domain/utils/value-objects/user-status.vo')>(
        '@/domain/utils/value-objects/user-status.vo',
      );
      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'ACTIVE',
      });

      aggregate.changeStatus(UserStatus.create('SUSPENDED'));

      const events = aggregate.pullDomainEvents();
      const event = events[0] as UserStatusChangedEvent;

      expect(events).toHaveLength(1);
      expect(event.eventName).toBe('user.status_changed');
      expect(event.oldStatus).toBe('ACTIVE');
      expect(event.newStatus).toBe('SUSPENDED');
    });

    it.each(['ACTIVE', 'PENDING', 'SUSPENDED'] as const)(
      'should throw DomainError for BANNED to %s transition',
      (targetStatus) => {
        expect.assertions(1);

        const { UserStatus } = jest.requireActual<typeof import('@/domain/utils/value-objects/user-status.vo')>(
          '@/domain/utils/value-objects/user-status.vo',
        );
        const aggregate = UserAggregate.fromPersistence({
          publicId: validUuid,
          name: 'Takuya',
          firebaseUid: 'firebase-uid-1',
          status: 'BANNED',
        });

        expect(() => {
          aggregate.changeStatus(UserStatus.create(targetStatus));
        }).toThrow(DomainError);
      },
    );

    it('should not emit event when BANNED to non-BANNED transition fails', () => {
      expect.assertions(2);

      const { UserStatus } = jest.requireActual<typeof import('@/domain/utils/value-objects/user-status.vo')>(
        '@/domain/utils/value-objects/user-status.vo',
      );
      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'BANNED',
      });

      expect(() => {
        aggregate.changeStatus(UserStatus.create('ACTIVE'));
      }).toThrow(DomainError);

      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it('should allow BANNED to BANNED (no-op transition)', () => {
      expect.assertions(1);

      const { UserStatus } = jest.requireActual<typeof import('@/domain/utils/value-objects/user-status.vo')>(
        '@/domain/utils/value-objects/user-status.vo',
      );
      const aggregate = UserAggregate.fromPersistence({
        publicId: validUuid,
        name: 'Takuya',
        firebaseUid: 'firebase-uid-1',
        status: 'BANNED',
      });

      aggregate.changeStatus(UserStatus.create('BANNED'));

      expect(aggregate.status.value).toBe('BANNED');
    });
  });
});
