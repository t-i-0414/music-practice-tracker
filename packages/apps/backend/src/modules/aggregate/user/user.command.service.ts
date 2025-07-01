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
  public constructor(
    private readonly repository: UserRepositoryService,
    private readonly queryService: UserQueryService,
  ) {}

  public async createUser(dto: CreateUserInputDto): Promise<ActiveUserResponseDto> {
    return toActiveUserDto(await this.repository.createUser(dto));
  }

  public async createManyAndReturnUsers({ users }: CreateManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    const createdUsers = await this.repository.createManyAndReturnUsers(users);
    return toActiveUsersDto(createdUsers);
  }

  public async updateUserById({ id, data }: UpdateUserInputDto): Promise<ActiveUserResponseDto> {
    await this.queryService.findUserByIdOrFail({ id });

    return toActiveUserDto(
      await this.repository.updateUser({
        where: { id },
        data,
      }),
    );
  }

  public async deleteUserById({ id }: DeleteUserByIdInputDto): Promise<void> {
    await this.repository.deleteUser({ id });
  }

  public async deleteManyUsersById({ ids }: DeleteManyUsersInputDto): Promise<void> {
    await this.repository.deleteManyUsers({
      id: { in: ids },
    });
  }

  public async hardDeleteUserById({ id }: HardDeleteUserByIdInputDto): Promise<void> {
    await this.repository.hardDeleteUser({ id });
  }

  public async hardDeleteManyUsersById({ ids }: HardDeleteManyUsersInputDto): Promise<void> {
    await this.repository.hardDeleteManyUsers({
      id: { in: ids },
    });
  }

  public async restoreUserById({ id }: RestoreUserByIdInputDto): Promise<ActiveUserResponseDto> {
    const restoredUser = await this.repository.restoreUser({ id });
    return toActiveUserDto(restoredUser);
  }

  public async restoreManyUsersById({ ids }: RestoreManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    const restoredUsers = await this.repository.restoreManyAndReturnUsers({
      id: { in: ids },
    });
    return toActiveUsersDto(restoredUsers);
  }
}
