import { faker } from '@faker-js/faker';

import { BaseFactory } from './base-factory';

import type { AdminUser } from '@/aggregates/admin-user/admin-user.repository.service';
import type { AdminUserResponseDto } from '@/aggregates/admin-user/admin-user.response.dto';
import { AdminRole, AdminStatus } from '@/generated/prisma';

const DEFAULT_ADMIN_USER = {
  role: AdminRole.VIEWER,
  status: AdminStatus.ACTIVE,
} as const;

export class AdminUserFactory extends BaseFactory<AdminUser> {
  public build(overrides?: Partial<AdminUser>): AdminUser {
    const id = this.incrementCounter();
    const now = new Date();

    return {
      id,
      publicId: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      ...DEFAULT_ADMIN_USER,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  public buildWithFixedId(overrides?: Partial<AdminUser>): AdminUser {
    const id = this.incrementCounter();
    return this.build({
      publicId: `admin-public-id-${id}`,
      email: `admin${id}@example.com`,
      name: `Admin User ${id}`,
      ...overrides,
    });
  }
}

export class AdminUserResponseDtoFactory extends BaseFactory<AdminUserResponseDto> {
  public build(overrides?: Partial<AdminUserResponseDto>): AdminUserResponseDto {
    const now = new Date();

    return {
      publicId: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      ...DEFAULT_ADMIN_USER,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  public buildFromEntity(adminUser: AdminUser): AdminUserResponseDto {
    const { id: _id, ...rest } = adminUser;
    return rest;
  }

  public buildWithFixedId(overrides?: Partial<AdminUserResponseDto>): AdminUserResponseDto {
    const id = this.incrementCounter();
    return this.build({
      publicId: `admin-response-public-id-${id}`,
      email: `admin${id}@example.com`,
      name: `Admin User ${id}`,
      ...overrides,
    });
  }
}
