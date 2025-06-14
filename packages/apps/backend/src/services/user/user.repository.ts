import { Prisma, User as UserEntity } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
import { Injectable } from '@nestjs/common';

export { UserEntity };

@Injectable()
export class UserRepository {
  constructor(private repository: RepositoryService) {}

  async findUser(params: Prisma.UserWhereUniqueInput): Promise<UserEntity | null> {
    return this.repository.user.findUnique({
      where: params,
    });
  }

  async findManyUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserEntity[]> {
    return this.repository.user.findMany({
      ...params,
    });
  }

  async createUser(params: Prisma.UserCreateInput): Promise<UserEntity> {
    return this.repository.user.create({
      data: params,
    });
  }

  async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<UserEntity> {
    const { where, data } = params;
    return this.repository.user.update({
      data,
      where,
    });
  }

  async deleteUser(params: Prisma.UserWhereUniqueInput): Promise<UserEntity> {
    return this.repository.user.delete({
      where: params,
    });
  }
}
