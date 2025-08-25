import { Injectable } from '@nestjs/common';

import { UserCommandService } from './user.command.service';
import { CreateUserInputDto, FindUserByIdInputDto, UpdateUserInputDto } from './user.input.dto';
import { UserQueryService } from './user.query.service';
import { UserResponseDto } from './user.response.dto';

@Injectable()
export class UserAppFacadeService {
  public constructor(
    private readonly userCommandService: UserCommandService,
    private readonly userQueryService: UserQueryService,
  ) {}

  public async findUserById(dto: FindUserByIdInputDto): Promise<UserResponseDto> {
    return this.userQueryService.findUserByIdOrFail(dto);
  }

  public async createUser(dto: CreateUserInputDto): Promise<UserResponseDto> {
    return this.userCommandService.createUser(dto);
  }

  public async updateUserById(dto: UpdateUserInputDto): Promise<UserResponseDto> {
    return this.userCommandService.updateUserById(dto);
  }
}
