import { faker } from '@faker-js/faker';

import { type AdminUser, AdminRole, AdminStatus } from '@/generated/prisma';

export class AdminUserFactory {
  private idCounter = 1;

  public build(overrides: Partial<AdminUser> = {}): AdminUser {
    const id = this.idCounter++;
    return {
      id,
      publicId: overrides.publicId ?? faker.string.uuid(),
      email: overrides.email ?? faker.internet.email(),
      name: overrides.name ?? faker.person.fullName(),
      role: overrides.role ?? AdminRole.VIEWER,
      status: overrides.status ?? AdminStatus.ACTIVE,
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    };
  }

  public buildMany(count: number, overrides: Partial<AdminUser> = {}): AdminUser[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}
