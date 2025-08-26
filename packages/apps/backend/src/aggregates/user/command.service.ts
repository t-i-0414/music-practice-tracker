import { Injectable } from '@nestjs/common';

import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  DeleteUserByIdInputDto,
  UpdateUserInputDto,
  toUserResponseDto,
  toUsersResponseDto,
  UserResponseDto,
  UsersResponseDto,
} from './dto';
import { UserQueryService } from './query.service';

import { Prisma, User } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

@Injectable()
export class UserCommandService {
  public constructor(
    private readonly repository: RepositoryService,
    private readonly queryService: UserQueryService,
  ) {}

  // Command service methods
  public async createUser(dto: CreateUserInputDto): Promise<UserResponseDto> {
    return toUserResponseDto(await this.createUserRecord(dto));
  }

  public async createManyAndReturnUsers({ users }: CreateManyUsersInputDto): Promise<UsersResponseDto> {
    const createdUsers = await this.createManyUserRecords(users);
    return toUsersResponseDto(createdUsers);
  }

  public async updateUserById({ publicId, data }: UpdateUserInputDto): Promise<UserResponseDto> {
    await this.queryService.findUserByIdOrFail({ publicId });

    return toUserResponseDto(
      await this.updateUser({
        where: { publicId },
        data,
      }),
    );
  }

  public async deleteUserById({ publicId }: DeleteUserByIdInputDto): Promise<void> {
    await this.queryService.findUserByIdOrFail({ publicId });
    await this.deleteUser({ publicId });
  }

  public async deleteManyUsersById({ publicIds }: DeleteManyUsersInputDto): Promise<void> {
    await this.deleteManyUsers({
      publicId: { in: publicIds },
    });
  }

  // Repository methods
  public async createUserRecord(params: Prisma.UserCreateInput): Promise<User> {
    return this.repository.user.create({
      data: params,
    });
  }

  public async createManyUserRecords(params: Prisma.UserCreateInput[]): Promise<User[]> {
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

  public async updateUserPassword(userPublicId: string, passwordHash: string): Promise<User> {
    return this.repository.user.update({
      where: { publicId: userPublicId },
      data: { passwordHash },
    });
  }

  public async createUserWithOAuth(data: Prisma.UserCreateInput): Promise<User> {
    return this.repository.user.create({
      data,
    });
  }

  public async updateOAuthProvider(
    userPublicId: string,
    provider: 'google' | 'apple',
    providerId: string,
  ): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {};
    if (provider === 'google') {
      updateData.googleId = providerId;
    } else {
      updateData.appleId = providerId;
    }

    return this.repository.user.update({
      where: { publicId: userPublicId },
      data: updateData,
    });
  }
}
