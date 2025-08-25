import { Injectable } from '@nestjs/common';

import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  DeleteUserByIdInputDto,
  UpdateUserInputDto,
} from './user.input.dto';
import { UserQueryService } from './user.query.service';
import { UserRepositoryService } from './user.repository.service';
import { toUserResponseDto, toUsersResponseDto, UserResponseDto, UsersResponseDto } from './user.response.dto';

@Injectable()
export class UserCommandService {
  public constructor(
    private readonly repository: UserRepositoryService,
    private readonly queryService: UserQueryService,
  ) {}

  public async createUser(dto: CreateUserInputDto): Promise<UserResponseDto> {
    return toUserResponseDto(await this.repository.createUser(dto));
  }

  public async createManyAndReturnUsers({ users }: CreateManyUsersInputDto): Promise<UsersResponseDto> {
    const createdUsers = await this.repository.createManyAndReturnUsers(users);
    return toUsersResponseDto(createdUsers);
  }

  public async updateUserById({ publicId, data }: UpdateUserInputDto): Promise<UserResponseDto> {
    await this.queryService.findUserByIdOrFail({ publicId });

    return toUserResponseDto(
      await this.repository.updateUser({
        where: { publicId },
        data,
      }),
    );
  }

  public async deleteUserById({ publicId }: DeleteUserByIdInputDto): Promise<void> {
    await this.queryService.findUserByIdOrFail({ publicId });
    await this.repository.deleteUser({ publicId });
  }

  public async deleteManyUsersById({ publicIds }: DeleteManyUsersInputDto): Promise<void> {
    await this.repository.deleteManyUsers({
      publicId: { in: publicIds },
    });
  }
}
