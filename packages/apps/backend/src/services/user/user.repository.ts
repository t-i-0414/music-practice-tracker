import { Prisma, User } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(private repository: RepositoryService) {}

  async findUniqueActiveUser(params: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.repository.user.findUnique({
      where: {
        ...params,
        deletedAt: null,
      },
    });
  }

  async findUniqueDeletedUser(params: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.repository.user.findUnique({
      where: {
        ...params,
        deletedAt: { not: null },
      },
    });
  }
  async findUniqueAnyUser(params: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.repository.user.findUnique({
      where: {
        ...params,
        OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
      },
    });
  }

  async findManyActiveUsers(params: {
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
        deletedAt: null,
      },
    });
  }

  async findManyDeletedUsers(params: {
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
        deletedAt: { not: null },
      },
    });
  }

  async findManyAnyUsers(params: {
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
        OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
      },
    });
  }

  async createUser(params: Prisma.UserCreateInput): Promise<User> {
    return this.repository.user.create({
      data: params,
    });
  }

  async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { where, data } = params;
    return this.repository.user.update({
      data,
      where,
    });
  }

  async deleteUser(params: Prisma.UserWhereUniqueInput): Promise<void> {
    await this.repository.user.update({
      where: params,
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
