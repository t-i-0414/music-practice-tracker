import { UserCreatedEvent, UserDeletedEvent } from './events';

import { AggregateRoot } from '@/domain/utils/aggregate-root.base';
import { toUserPublicId } from '@/domain/utils/brand-constructors';
import type { UserPublicId } from '@/domain/utils/branded';
import { DomainError } from '@/domain/utils/domain.error';
import { UserName } from '@/domain/utils/value-objects/user-name.vo';
import { UserStatus } from '@/domain/utils/value-objects/user-status.vo';

type UserProps = {
  name: UserName;
  firebaseUid: string;
  status: UserStatus;
};

export class UserAggregate extends AggregateRoot<UserProps, UserPublicId> {
  private constructor(publicId: UserPublicId, props: UserProps) {
    super(publicId, props);
  }

  /** Factory: validate inputs + create aggregate + emit UserCreatedEvent. */
  public static create(params: { publicId: string; name: string; firebaseUid: string }): UserAggregate {
    const userPublicId = toUserPublicId(params.publicId);
    const name = UserName.create(params.name);
    const status = UserStatus.fromPersistence('ACTIVE');

    const aggregate = new UserAggregate(userPublicId, {
      name,
      firebaseUid: params.firebaseUid,
      status,
    });
    aggregate.addDomainEvent(new UserCreatedEvent(userPublicId, name.value, params.firebaseUid));
    return aggregate;
  }

  /** Reconstitute from DB without validation or events. */
  public static fromPersistence(params: {
    publicId: string;
    name: string;
    firebaseUid: string;
    status: string;
  }): UserAggregate {
    const userPublicId = toUserPublicId(params.publicId);
    const name = UserName.fromPersistence(params.name);
    const status = UserStatus.fromPersistence(params.status);

    return new UserAggregate(userPublicId, {
      name,
      firebaseUid: params.firebaseUid,
      status,
    });
  }

  /** Emit UserCreatedEvent for an already-persisted aggregate. */
  public markAsCreated(): void {
    this.addDomainEvent(new UserCreatedEvent(this.publicId, this.props.name.value, this.props.firebaseUid));
  }

  /** Emit UserDeletedEvent. */
  public markAsDeleted(): void {
    this.addDomainEvent(new UserDeletedEvent(this.publicId));
  }

  public changeName(newName: UserName): void {
    this.props = { ...this.props, name: newName };
  }

  public changeStatus(newStatus: UserStatus): void {
    this.validateStatusTransition(this.props.status, newStatus);
    this.props = { ...this.props, status: newStatus };
  }

  public get name(): UserName {
    return this.props.name;
  }

  public get firebaseUid(): string {
    return this.props.firebaseUid;
  }

  public get status(): UserStatus {
    return this.props.status;
  }

  private validateStatusTransition(current: UserStatus, next: UserStatus): void {
    if (current.isBanned() && !next.isBanned()) {
      throw new DomainError(
        'DO0003',
        `Cannot transition from ${current.value} to ${next.value}. BANNED is a terminal state.`,
      );
    }
  }
}
