import { ValueObject } from '../value-object.base';

import { DomainError } from '@/domain/utils/domain.error';

const VALID_STATUSES = ['ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED'] as const;
type UserStatusValue = (typeof VALID_STATUSES)[number];

type UserStatusProps = {
  value: UserStatusValue;
};

export class UserStatus extends ValueObject<UserStatusProps> {
  private constructor(props: UserStatusProps) {
    super(props);
  }

  public static create(status: string): UserStatus {
    if (!UserStatus.isValid(status)) {
      throw new DomainError('DO0001', `Invalid user status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    return new UserStatus({ value: status });
  }

  /** Reconstitute from persistence. DB enum constraint guarantees invariants. */
  public static fromPersistence(status: string): UserStatus {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion -- DB enum constraint guarantees valid value
    return new UserStatus({ value: status as UserStatusValue });
  }

  private static isValid(status: string): status is UserStatusValue {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- type narrowing for includes check
    return (VALID_STATUSES as readonly string[]).includes(status);
  }

  public get value(): UserStatusValue {
    return this.props.value;
  }

  public toValue(): UserStatusValue {
    return this.props.value;
  }

  public isActive(): boolean {
    return this.props.value === 'ACTIVE';
  }

  public isBanned(): boolean {
    return this.props.value === 'BANNED';
  }
}
