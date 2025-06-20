import { Injectable } from '@nestjs/common';
import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  DeleteUserByIdInputDto,
  HardDeleteManyUsersInputDto,
  HardDeleteUserByIdInputDto,
  RestoreManyUsersInputDto,
  RestoreUserByIdInputDto,
  UpdateUserInputDto,
} from './user.input.dto';
import { UserQueryService } from './user.query.service';
import { UserRepositoryService } from './user.repository.service';
import { ActiveUserResponseDto, ActiveUsersResponseDto, toActiveUserDto, toActiveUsersDto } from './user.response.dto';

@Injectable()
export class UserCommandService {
  constructor(
    private repository: UserRepositoryService,
    private queryService: UserQueryService,
  ) {}

  async createUser(dto: CreateUserInputDto): Promise<ActiveUserResponseDto> {
    return toActiveUserDto(await this.repository.createUser(dto));
  }

  async createManyAndReturnUsers({ users }: CreateManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    const createdUsers = await this.repository.createManyAndReturnUsers(users);
    return toActiveUsersDto(createdUsers);
  }

  async updateUserById({ id, data }: UpdateUserInputDto): Promise<ActiveUserResponseDto> {
    await this.queryService.findUserByIdOrFail({ id });

    return toActiveUserDto(
      await this.repository.updateUser({
        where: { id },
        data: {
          ...data,
        },
      }),
    );
  }

  async deleteUserById({ id }: DeleteUserByIdInputDto): Promise<void> {
    await this.repository.deleteUser({ id });
  }

  async deleteManyUsersById({ ids }: DeleteManyUsersInputDto): Promise<void> {
    await this.repository.deleteManyUsers({
      id: { in: ids },
    });
  }

  async hardDeleteUserById({ id }: HardDeleteUserByIdInputDto): Promise<void> {
    await this.repository.hardDeleteUser({ id });
  }

  async hardDeleteManyUsersById({ ids }: HardDeleteManyUsersInputDto): Promise<void> {
    await this.repository.hardDeleteManyUsers({
      id: { in: ids },
    });
  }

  async restoreUserById({ id }: RestoreUserByIdInputDto): Promise<ActiveUserResponseDto> {
    const restoredUser = await this.repository.restoreUser({ id });
    return toActiveUserDto(restoredUser);
  }

  async restoreManyUsersById({ ids }: RestoreManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    const restoredUsers = await this.repository.restoreManyAndReturnUsers({
      id: { in: ids },
    });
    return toActiveUsersDto(restoredUsers);
  }
}
