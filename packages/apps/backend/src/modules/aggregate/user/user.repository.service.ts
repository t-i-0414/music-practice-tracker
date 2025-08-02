import { Injectable } from '@nestjs/common';

import { Prisma, User } from '@/generated/prisma';
import { RepositoryService } from '@/modules/repository/repository.service';
export type { User, UserStatus as UserStatusEnumType } from '@/generated/prisma';

@Injectable()
export class UserRepositoryService {
  public constructor(private readonly repository: RepositoryService) {}

  public async findUniqueUser(params: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.repository.user.findUnique({
      where: {
        ...params,
      },
    });
  }

  public async findManyUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return this.repository.user.findMany({
      ...params,
      where: {
        ...params.where,
      },
    });
  }

  public async createUser(params: Prisma.UserCreateInput): Promise<User> {
    return this.repository.user.create({
      data: params,
    });
  }

  public async createManyAndReturnUsers(params: Prisma.UserCreateInput[]): Promise<User[]> {
    return this.repository.user.createManyAndReturn({
      data: params,
    });
  }

  public async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { where, data } = params;
    return this.repository.user.update({
      data: {
        ...data,
      },
      where: {
        ...where,
      },
    });
  }

  public async deleteUser(params: Prisma.UserWhereUniqueInput): Promise<void> {
    await this.repository.user.delete({
      where: params,
    });
  }

  public async deleteManyUsers(params: Prisma.UserWhereInput): Promise<void> {
    await this.repository.user.deleteMany({
      where: params,
    });
  }
}
