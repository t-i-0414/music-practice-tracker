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
} from './utils/dto';

import { RepositoryService } from '@/repository/repository.service';
import { Metrics } from '@/utils/metrics/dogstatsd.metrics';

@Injectable()
export class UserCommandService {
  public constructor(private readonly repository: RepositoryService) {}

  public async createUser(dto: CreateUserInputDto): Promise<UserResponseDto> {
    const user = toUserResponseDto(await this.repository.user.create({ data: dto }));
    Metrics.incrementUserCreated();
    return user;
  }

  public async createManyAndReturnUsers({ users }: CreateManyUsersInputDto): Promise<UsersResponseDto> {
    return toUsersResponseDto(await this.repository.user.createManyAndReturn({ data: users }));
  }

  public async updateUserById({ publicId, data }: UpdateUserInputDto): Promise<UserResponseDto> {
    return toUserResponseDto(
      await this.repository.user.update({
        where: { publicId },
        data,
      }),
    );
  }

  public async deleteUserById({ publicId }: DeleteUserByIdInputDto): Promise<void> {
    await this.repository.user.delete({
      where: { publicId },
    });
  }

  public async deleteManyUsersById({ publicIds }: DeleteManyUsersInputDto): Promise<void> {
    await this.repository.user.deleteMany({
      where: { publicId: { in: publicIds } },
    });
  }
}
