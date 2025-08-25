import { Injectable, NotFoundException } from '@nestjs/common';

import { FindManyUsersByIdInputDto, FindUserByIdInputDto } from './user.input.dto';
import { UserRepositoryService } from './user.repository.service';
import { toUserResponseDto, toUsersResponseDto, UserResponseDto, UsersResponseDto } from './user.response.dto';

@Injectable()
export class UserQueryService {
  public constructor(private readonly repository: UserRepositoryService) {}

  public async findUserByIdOrFail(dto: FindUserByIdInputDto): Promise<UserResponseDto> {
    const user = await this.repository.findUniqueUser(dto);
    if (!user) throw new NotFoundException(`User ${dto.publicId} not found`);

    return toUserResponseDto(user);
  }

  public async findManyUsers(dto: FindManyUsersByIdInputDto): Promise<UsersResponseDto> {
    const users = await this.repository.findManyUsers({
      where: {
        publicId: { in: dto.publicIds },
      },
    });

    return toUsersResponseDto(users);
  }
}
