import { Injectable } from '@nestjs/common';

import { UserCommandService } from './user.command.service';
import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  FindManyUsersByIdInputDto,
  FindUserByIdInputDto,
  DeleteManyUsersInputDto,
  DeleteUserByIdInputDto,
  UpdateUserInputDto,
} from './user.input.dto';
import { UserQueryService } from './user.query.service';
import { UserResponseDto, UsersResponseDto } from './user.response.dto';

@Injectable()
export class UserAdminFacadeService {
  public constructor(
    private readonly userCommandService: UserCommandService,
    private readonly userQueryService: UserQueryService,
  ) {}

  public async findUserById(dto: FindUserByIdInputDto): Promise<UserResponseDto> {
    return this.userQueryService.findUserByIdOrFail(dto);
  }

  public async findManyUsers(dto: FindManyUsersByIdInputDto): Promise<UsersResponseDto> {
    return this.userQueryService.findManyUsers(dto);
  }

  public async createUser(dto: CreateUserInputDto): Promise<UserResponseDto> {
    return this.userCommandService.createUser(dto);
  }

  public async createManyAndReturnUsers(dto: CreateManyUsersInputDto): Promise<UsersResponseDto> {
    return this.userCommandService.createManyAndReturnUsers(dto);
  }

  public async updateUserById(dto: UpdateUserInputDto): Promise<UserResponseDto> {
    return this.userCommandService.updateUserById(dto);
  }

  public async deleteUserById({ publicId }: DeleteUserByIdInputDto): Promise<void> {
    await this.userCommandService.deleteUserById({ publicId });
  }

  public async deleteManyUsersById({ publicIds }: DeleteManyUsersInputDto): Promise<void> {
    await this.userCommandService.deleteManyUsersById({ publicIds });
  }
}
