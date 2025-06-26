import { StrictOmit } from '@/common/types/strict-omit';
import { Prisma, User } from '@/generated/prisma';
import { RepositoryService } from '@/modules/repository/repository.service';
import { Injectable } from '@nestjs/common';
export type { User };

@Injectable()
export class UserRepositoryService {
  public constructor(private repository: RepositoryService) {}

  public async findUniqueActiveUser(params: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.repository.user.findUnique({
      where: {
        ...params,
        deletedAt: null,
      },
    });
  }

  public async findUniqueDeletedUser(params: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.repository.user.findUnique({
      where: {
        ...params,
        deletedAt: { not: null },
      },
    });
  }
  public async findUniqueAnyUser(params: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.repository.user.findUnique({
      where: {
        ...params,
        OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
      },
    });
  }

  public async findManyActiveUsers(params: {
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

  public async findManyDeletedUsers(params: {
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

  public async findManyAnyUsers(params: {
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

  public async createUser(params: StrictOmit<Prisma.UserCreateInput, 'deletedAt'>): Promise<User> {
    return this.repository.user.create({
      data: params,
    });
  }

  public async createManyAndReturnUsers(params: StrictOmit<Prisma.UserCreateInput, 'deletedAt'>[]): Promise<User[]> {
    return this.repository.user.createManyAndReturn({
      data: params,
    });
  }

  public async updateUser(params: {
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

  public async deleteUser(params: Prisma.UserWhereUniqueInput): Promise<void> {
    await this.repository.user.update({
      where: params,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async deleteManyUsers(params: Prisma.UserWhereInput): Promise<void> {
    await this.repository.user.updateMany({
      where: params,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async hardDeleteUser(params: Prisma.UserWhereUniqueInput): Promise<void> {
    await this.repository.user.delete({
      where: params,
    });
  }

  public async hardDeleteManyUsers(params: Prisma.UserWhereInput): Promise<void> {
    await this.repository.user.deleteMany({
      where: params,
    });
  }

  public async restoreUser(params: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.repository.user.update({
      where: params,
      data: {
        deletedAt: null,
      },
    });
  }

  public async restoreManyAndReturnUsers(params: Prisma.UserWhereInput): Promise<User[]> {
    return this.repository.user.updateManyAndReturn({
      where: params,
      data: {
        deletedAt: null,
      },
    });
  }
}
