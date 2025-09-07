import { faker } from '@faker-js/faker';

const firstIdCounter = 1;

import { type User, UserStatus } from '@/generated/prisma';

export class UserFactory {
  private idCounter = firstIdCounter;

  public build(overrides: Partial<User> = {}): User {
    const id = this.idCounter++;
    return {
      id,
      publicId: overrides.publicId ?? faker.string.uuid(),
      email: overrides.email ?? faker.internet.email(),
      name: overrides.name ?? faker.person.fullName(),
      status: overrides.status ?? UserStatus.ACTIVE,
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    };
  }

  public buildMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}
