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
  public constructor(
    private readonly userCommandService: UserCommandService,
    private readonly userQueryService: UserQueryService,
  ) {}

  public async findUserById(dto: FindUserByIdInputDto): Promise<ActiveUserResponseDto> {
    return await this.userQueryService.findUserByIdOrFail(dto);
  }

  public async findDeletedUserById(dto: FindUserByIdInputDto): Promise<DeletedUserResponseDto> {
    return await this.userQueryService.findDeletedUserByIdOrFail(dto);
  }

  public async findAnyUserById(dto: FindUserByIdInputDto): Promise<AnyUserResponseDto> {
    return await this.userQueryService.findAnyUserByIdOrFail(dto);
  }

  public async findManyUsers(dto: FindManyUsersByIdInputDto): Promise<ActiveUsersResponseDto> {
    return await this.userQueryService.findManyUsers(dto);
  }

  public async findManyDeletedUsers(dto: FindManyUsersByIdInputDto): Promise<DeletedUsersResponseDto> {
    return await this.userQueryService.findManyDeletedUsers(dto);
  }

  public async findManyAnyUsers(dto: FindManyUsersByIdInputDto): Promise<AnyUsersResponseDto> {
    return await this.userQueryService.findManyAnyUsers(dto);
  }

  public async createUser(dto: CreateUserInputDto): Promise<ActiveUserResponseDto> {
    return await this.userCommandService.createUser(dto);
  }

  public async createManyAndReturnUsers(dto: CreateManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    return await this.userCommandService.createManyAndReturnUsers(dto);
  }

  public async updateUserById(dto: UpdateUserInputDto): Promise<ActiveUserResponseDto> {
    return await this.userCommandService.updateUserById(dto);
  }

  public async deleteUserById(dto: DeleteUserByIdInputDto): Promise<void> {
    await this.userCommandService.deleteUserById(dto);
  }

  public async deleteManyUsersById({ ids }: DeleteManyUsersInputDto): Promise<void> {
    await this.userCommandService.deleteManyUsersById({ ids });
  }

  public async hardDeleteUserById({ id }: HardDeleteUserByIdInputDto): Promise<void> {
    await this.userCommandService.hardDeleteUserById({ id });
  }

  public async hardDeleteManyUsersById({ ids }: HardDeleteManyUsersInputDto): Promise<void> {
    await this.userCommandService.hardDeleteManyUsersById({ ids });
  }

  public async restoreUserById({ id }: RestoreUserByIdInputDto): Promise<ActiveUserResponseDto> {
    return await this.userCommandService.restoreUserById({ id });
  }

  public async restoreManyUsersById({ ids }: RestoreManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    return await this.userCommandService.restoreManyUsersById({ ids });
  }
}
