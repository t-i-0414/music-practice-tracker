import { Injectable, NotFoundException } from '@nestjs/common';

import { FindManyUsersByIdInputDto, FindUserByIdInputDto } from './user.input.dto';
import { UserRepositoryService } from './user.repository.service';
import {
  ActiveUserResponseDto,
  ActiveUsersResponseDto,
  AnyUserResponseDto,
  AnyUsersResponseDto,
  DeletedUserResponseDto,
  DeletedUsersResponseDto,
  SuspendedUserResponseDto,
  SuspendedUsersResponseDto,
  toActiveUserDto,
  toActiveUsersDto,
  toAnyUserDto,
  toAnyUsersDto,
  toDeletedUserDto,
  toDeletedUsersDto,
  toSuspendedUserDto,
  toSuspendedUsersDto,
} from './user.response.dto';

@Injectable()
export class UserQueryService {
  public constructor(private readonly repository: UserRepositoryService) {}

  public async findUserByIdOrFail(dto: FindUserByIdInputDto): Promise<ActiveUserResponseDto> {
    const user = await this.repository.findUniqueActiveUser(dto);
    if (!user) throw new NotFoundException(`User ${dto.publicId} not found`);

    return toActiveUserDto(user);
  }

  public async findDeletedUserByIdOrFail(dto: FindUserByIdInputDto): Promise<DeletedUserResponseDto> {
    const user = await this.repository.findUniqueDeletedUser(dto);
    if (!user) throw new NotFoundException(`Deleted user ${dto.publicId} not found`);

    return toDeletedUserDto(user);
  }

  public async findSuspendedUserByIdOrFail(dto: FindUserByIdInputDto): Promise<SuspendedUserResponseDto> {
    const user = await this.repository.findUniqueSuspendedUser(dto);
    if (!user) throw new NotFoundException(`Suspended user ${dto.publicId} not found`);

    return toSuspendedUserDto(user);
  }

  public async findAnyUserByIdOrFail(dto: FindUserByIdInputDto): Promise<AnyUserResponseDto> {
    const user = await this.repository.findUniqueAnyUser(dto);
    if (!user) throw new NotFoundException(`User ${dto.publicId} not found`);

    return toAnyUserDto(user);
  }

  public async findManyUsers(dto: FindManyUsersByIdInputDto): Promise<ActiveUsersResponseDto> {
    const users = await this.repository.findManyActiveUsers({
      where: {
        publicId: { in: dto.publicIds },
      },
    });

    return toActiveUsersDto(users);
  }

  public async findManyDeletedUsers(dto: FindManyUsersByIdInputDto): Promise<DeletedUsersResponseDto> {
    const users = await this.repository.findManyDeletedUsers({
      where: {
        publicId: { in: dto.publicIds },
      },
    });

    return toDeletedUsersDto(users);
  }

  public async findManySuspendedUsers(dto: FindManyUsersByIdInputDto): Promise<SuspendedUsersResponseDto> {
    const users = await this.repository.findManySuspendedUsers({
      where: {
        publicId: { in: dto.publicIds },
      },
    });

    return toSuspendedUsersDto(users);
  }

  public async findManyAnyUsers(dto: FindManyUsersByIdInputDto): Promise<AnyUsersResponseDto> {
    const users = await this.repository.findManyAnyUsers({
      where: {
        publicId: { in: dto.publicIds },
      },
    });

    return toAnyUsersDto(users);
  }
}
