import { Injectable } from '@nestjs/common';
import { UserCommandService } from './user.command.service';
import { CreateUserInputDto, DeleteUserByIdInputDto, FindUserByIdInputDto, UpdateUserInputDto } from './user.input.dto';
import { UserQueryService } from './user.query.service';
import { ActiveUserResponseDto } from './user.response.dto';

@Injectable()
export class UserAppFacadeService {
  public constructor(
    private readonly userCommandService: UserCommandService,
    private readonly userQueryService: UserQueryService,
  ) {}

  public async findUserById(dto: FindUserByIdInputDto): Promise<ActiveUserResponseDto> {
    return this.userQueryService.findUserByIdOrFail(dto);
  }

  public async createUser(dto: CreateUserInputDto): Promise<ActiveUserResponseDto> {
    return this.userCommandService.createUser(dto);
  }

  public async updateUserById(dto: UpdateUserInputDto): Promise<ActiveUserResponseDto> {
    return this.userCommandService.updateUserById(dto);
  }

  public async deleteUserById(dto: DeleteUserByIdInputDto): Promise<void> {
    await this.userCommandService.deleteUserById(dto);
  }
}
