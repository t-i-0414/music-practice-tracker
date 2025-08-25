import { Injectable } from '@nestjs/common';

import { AdminUser, Prisma } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
export type { AdminUser, AdminRole as AdminRoleEnumType, AdminStatus as AdminStatusEnumType } from '@/generated/prisma';

@Injectable()
export class AdminUserRepositoryService {
  public constructor(private readonly repository: RepositoryService) {}

  public async findUniqueAdminUser(params: Prisma.AdminUserWhereUniqueInput): Promise<AdminUser | null> {
    return this.repository.adminUser.findUnique({
      where: {
        ...params,
      },
    });
  }

  public async findManyAdminUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AdminUserWhereUniqueInput;
    where?: Prisma.AdminUserWhereInput;
    orderBy?: Prisma.AdminUserOrderByWithRelationInput;
  }): Promise<AdminUser[]> {
    return this.repository.adminUser.findMany({
      ...params,
      where: {
        ...params.where,
      },
    });
  }

  public async createAdminUser(params: Prisma.AdminUserCreateInput): Promise<AdminUser> {
    return this.repository.adminUser.create({
      data: params,
    });
  }

  public async createManyAndReturnAdminUsers(params: Prisma.AdminUserCreateInput[]): Promise<AdminUser[]> {
    return this.repository.adminUser.createManyAndReturn({
      data: params,
    });
  }

  public async updateAdminUser(params: {
    where: Prisma.AdminUserWhereUniqueInput;
    data: Prisma.AdminUserUpdateInput;
  }): Promise<AdminUser> {
    const { where, data } = params;
    return this.repository.adminUser.update({
      data: {
        ...data,
      },
      where: {
        ...where,
      },
    });
  }

  public async deleteAdminUser(params: Prisma.AdminUserWhereUniqueInput): Promise<void> {
    await this.repository.adminUser.delete({
      where: params,
    });
  }

  public async deleteManyAdminUsers(params: Prisma.AdminUserWhereInput): Promise<void> {
    await this.repository.adminUser.deleteMany({
      where: params,
    });
  }
}
