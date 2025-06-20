import { Injectable } from '@nestjs/common';
import { UserCommandService } from './user.command.service';
import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  DeleteUserByIdInputDto,
  FindManyUsersByIdInputDto,
  FindUserByIdInputDto,
  HardDeleteManyUsersInputDto,
  HardDeleteUserByIdInputDto,
  RestoreManyUsersInputDto,
  RestoreUserByIdInputDto,
  UpdateUserInputDto,
} from './user.input.dto';
import { UserQueryService } from './user.query.service';
import {
  ActiveUserResponseDto,
  ActiveUsersResponseDto,
  AnyUserResponseDto,
  AnyUsersResponseDto,
  DeletedUserResponseDto,
  DeletedUsersResponseDto,
} from './user.response.dto';

@Injectable()
export class UserAdminFacadeService {
  constructor(
    private readonly userCommandService: UserCommandService,
    private readonly userQueryService: UserQueryService,
  ) {}

  async findUserById(dto: FindUserByIdInputDto): Promise<ActiveUserResponseDto> {
    return await this.userQueryService.findUserByIdOrFail(dto);
  }

  async findDeletedUserById(dto: FindUserByIdInputDto): Promise<DeletedUserResponseDto> {
    return await this.userQueryService.findDeletedUserByIdOrFail(dto);
  }

  async findAnyUserById(dto: FindUserByIdInputDto): Promise<AnyUserResponseDto> {
    return await this.userQueryService.findAnyUserByIdOrFail(dto);
  }

  async findManyUsers(dto: FindManyUsersByIdInputDto): Promise<ActiveUsersResponseDto> {
    return await this.userQueryService.findManyUsers(dto);
  }

  async findManyDeletedUsers(dto: FindManyUsersByIdInputDto): Promise<DeletedUsersResponseDto> {
    return await this.userQueryService.findManyDeletedUsers(dto);
  }

  async findManyAnyUsers(dto: FindManyUsersByIdInputDto): Promise<AnyUsersResponseDto> {
    return await this.userQueryService.findManyAnyUsers(dto);
  }

  async createUser(dto: CreateUserInputDto): Promise<ActiveUserResponseDto> {
    return await this.userCommandService.createUser(dto);
  }

  async createManyAndReturnUsers(dto: CreateManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    return await this.userCommandService.createManyAndReturnUsers(dto);
  }

  async updateUserById(dto: UpdateUserInputDto): Promise<ActiveUserResponseDto> {
    return await this.userCommandService.updateUserById(dto);
  }

  async deleteUserById(dto: DeleteUserByIdInputDto): Promise<void> {
    return await this.userCommandService.deleteUserById(dto);
  }

  async deleteManyUsersById({ ids }: DeleteManyUsersInputDto): Promise<void> {
    return await this.userCommandService.deleteManyUsersById({ ids });
  }

  async hardDeleteUserById({ id }: HardDeleteUserByIdInputDto): Promise<void> {
    return await this.userCommandService.hardDeleteUserById({ id });
  }

  async hardDeleteManyUsersById({ ids }: HardDeleteManyUsersInputDto): Promise<void> {
    return await this.userCommandService.hardDeleteManyUsersById({ ids });
  }

  async restoreUserById({ id }: RestoreUserByIdInputDto): Promise<ActiveUserResponseDto> {
    return await this.userCommandService.restoreUserById({ id });
  }

  async restoreManyUsersById({ ids }: RestoreManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    return await this.userCommandService.restoreManyUsersById({ ids });
  }
}
