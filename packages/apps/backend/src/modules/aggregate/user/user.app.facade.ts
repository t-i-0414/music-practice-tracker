import { Injectable } from '@nestjs/common';
import { UserCommandService } from './user.command.service';
import { CreateUserInputDto, DeleteUserByIdInputDto, FindUserByIdInputDto, UpdateUserInputDto } from './user.input.dto';
import { UserQueryService } from './user.query.service';
import { ActiveUserResponseDto } from './user.response.dto';

@Injectable()
export class UserAppFacade {
  constructor(
    private readonly userCommandService: UserCommandService,
    private readonly userQueryService: UserQueryService,
  ) {}

  async findUserById(dto: FindUserByIdInputDto): Promise<ActiveUserResponseDto> {
    return await this.userQueryService.findUserByIdOrFail(dto);
  }

  async createUser(dto: CreateUserInputDto): Promise<ActiveUserResponseDto> {
    return await this.userCommandService.createUser(dto);
  }

  async updateUserById(dto: UpdateUserInputDto): Promise<ActiveUserResponseDto> {
    return await this.userCommandService.updateUserById(dto);
  }

  async deleteUserById(dto: DeleteUserByIdInputDto): Promise<void> {
    return await this.userCommandService.deleteUserById(dto);
  }
}
