import { faker } from '@faker-js/faker';

const firstIdCounter = 1;

import { type User, UserStatus } from '@/generated/prisma';

export class UserFactory {
  private idCounter = firstIdCounter;

  public build(overrides: Partial<User> & Record<string, unknown> = {}): User {
    const id = this.idCounter++;
    return {
      id,
      publicId: overrides.publicId ?? faker.string.uuid(),
      name: overrides.name ?? faker.person.fullName(),
      firebaseUid: overrides.firebaseUid ?? faker.string.uuid(),
      status: overrides.status ?? UserStatus.ACTIVE,
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    };
  }

  public buildMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}
