import { faker } from '@faker-js/faker';

import { BaseFactory } from './base-factory';

import type { User } from '@/generated/prisma';
import { UserStatus } from '@/generated/prisma';
import type { UserResponseDto } from '@/modules/aggregate/user/user.response.dto';

const DEFAULT_USER = {
  status: UserStatus.ACTIVE,
} as const;

export class UserFactory extends BaseFactory<User> {
  public build(overrides?: Partial<User>): User {
    const id = this.incrementCounter();
    const now = new Date();

    return {
      id,
      publicId: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      ...DEFAULT_USER,
      appleId: null,
      googleId: null,
      passwordHash: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  public buildWithFixedId(overrides?: Partial<User>): User {
    const id = this.incrementCounter();
    return this.build({
      publicId: `user-public-id-${id}`,
      email: `user${id}@example.com`,
      name: `User ${id}`,
      ...overrides,
    });
  }
}

export class UserResponseDtoFactory extends BaseFactory<UserResponseDto> {
  public build(overrides?: Partial<UserResponseDto>): UserResponseDto {
    const now = new Date();

    return {
      publicId: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      ...DEFAULT_USER,
      googleId: null,
      appleId: null,
      passwordHash: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  public buildFromEntity(user: User): UserResponseDto {
    const { id: _id, ...rest } = user;
    return rest;
  }

  public buildWithFixedId(overrides?: Partial<UserResponseDto>): UserResponseDto {
    const id = this.incrementCounter();
    return this.build({
      publicId: `user-response-public-id-${id}`,
      email: `user${id}@example.com`,
      name: `User ${id}`,
      ...overrides,
    });
  }
}
