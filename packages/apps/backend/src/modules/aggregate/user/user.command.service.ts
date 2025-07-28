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

  public async updateUserById({ publicId, data }: UpdateUserInputDto): Promise<ActiveUserResponseDto> {
    await this.queryService.findUserByIdOrFail({ publicId });

    return toActiveUserDto(
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

  public async hardDeleteUserById({ publicId }: HardDeleteUserByIdInputDto): Promise<void> {
    await this.queryService.findAnyUserByIdOrFail({ publicId });
    await this.repository.hardDeleteUser({ publicId });
  }

  public async hardDeleteManyUsersById({ publicIds }: HardDeleteManyUsersInputDto): Promise<void> {
    await this.repository.hardDeleteManyUsers({
      publicId: { in: publicIds },
    });
  }

  public async restoreUserById({ publicId }: RestoreUserByIdInputDto): Promise<ActiveUserResponseDto> {
    const restoredUser = await this.repository.restoreUser({ publicId });
    return toActiveUserDto(restoredUser);
  }

  public async restoreManyUsersById({ publicIds }: RestoreManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    const restoredUsers = await this.repository.restoreManyAndReturnUsers({
      publicId: { in: publicIds },
    });
    return toActiveUsersDto(restoredUsers);
  }
}
