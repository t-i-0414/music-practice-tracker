import { StrictOmit } from '@/common/types/strict-omit';
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

  async createUser(params: StrictOmit<Prisma.UserCreateInput, 'deletedAt'>): Promise<User> {
    return this.repository.user.create({
      data: params,
    });
  }

  async createManyAndReturnUsers(params: StrictOmit<Prisma.UserCreateInput, 'deletedAt'>): Promise<User[]> {
    return this.repository.user.createManyAndReturn({
      data: params,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: StrictOmit<Prisma.UserUpdateInput, 'deletedAt'>;
  }): Promise<User> {
    const { where, data } = params;
    return this.repository.user.update({
      data: {
        ...data,
      },
      where,
    });
  }

  async updateManyUsers(params: {
    where: Prisma.UserWhereInput;
    data: StrictOmit<Prisma.UserUpdateInput, 'deletedAt'>;
  }): Promise<Prisma.BatchPayload> {
    return this.repository.user.updateMany({
      where: params.where,
      data: params.data,
    });
  }

  async updateManyAndReturnUsers(params: {
    where: Prisma.UserWhereInput;
    data: StrictOmit<Prisma.UserUpdateInput, 'deletedAt'>;
  }): Promise<User[]> {
    return this.repository.user.updateManyAndReturn({
      where: params.where,
      data: params.data,
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

  async deleteManyAndReturnUsers(params: Prisma.UserWhereInput): Promise<User[]> {
    return await this.repository.user.updateManyAndReturn({
      where: params,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async deleteManyUsers(params: Prisma.UserWhereInput): Promise<void> {
    await this.repository.user.updateMany({
      where: params,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async hardDeleteUser(params: Prisma.UserWhereUniqueInput): Promise<void> {
    await this.repository.user.delete({
      where: params,
    });
  }

  async hardDeleteManyUsers(params: Prisma.UserWhereInput): Promise<void> {
    await this.repository.user.deleteMany({
      where: params,
    });
  }

  async restoreUser(params: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.repository.user.update({
      where: params,
      data: {
        deletedAt: null,
      },
    });
  }

  async restoreManyAndReturnUsers(params: Prisma.UserWhereInput): Promise<User[]> {
    return this.repository.user.updateManyAndReturn({
      where: params,
      data: {
        deletedAt: null,
      },
    });
  }
}
