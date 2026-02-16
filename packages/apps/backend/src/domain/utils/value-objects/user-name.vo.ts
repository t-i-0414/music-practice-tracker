import { ValueObject } from '../value-object.base';

import { DomainError } from '@/domain/utils/domain.error';

type UserNameProps = {
  value: string;
};

export class UserName extends ValueObject<UserNameProps> {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- domain constant: max user name length
  public static readonly MAX_LENGTH = 50;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- domain constant: min user name length
  public static readonly MIN_LENGTH = 1;

  private constructor(props: UserNameProps) {
    super(props);
  }

  public static create(name: string): UserName {
    const trimmed = name.trim();
    if (trimmed.length < UserName.MIN_LENGTH) {
      throw new DomainError('DO0001', `User name must be at least ${String(UserName.MIN_LENGTH)} character(s).`);
    }
    if (trimmed.length > UserName.MAX_LENGTH) {
      throw new DomainError('DO0001', `User name must be at most ${String(UserName.MAX_LENGTH)} characters.`);
    }
    return new UserName({ value: trimmed });
  }

  /** Reconstitute from persistence. DB constraints (NOT NULL, VARCHAR(50)) guarantee invariants. */
  public static fromPersistence(name: string): UserName {
    return new UserName({ value: name });
  }

  public get value(): string {
    return this.props.value;
  }

  public toValue(): string {
    return this.props.value;
  }
}
