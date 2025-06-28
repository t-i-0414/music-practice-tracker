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
  toActiveUserDto,
  toActiveUsersDto,
  toAnyUserDto,
  toAnyUsersDto,
  toDeletedUserDto,
  toDeletedUsersDto,
} from './user.response.dto';

@Injectable()
export class UserQueryService {
  public constructor(private readonly repository: UserRepositoryService) {}

  public async findUserByIdOrFail(dto: FindUserByIdInputDto): Promise<ActiveUserResponseDto> {
    const user = await this.repository.findUniqueActiveUser(dto);
    if (!user) throw new NotFoundException(`User ${dto.id} not found`);

    return toActiveUserDto(user);
  }

  public async findDeletedUserByIdOrFail(dto: FindUserByIdInputDto): Promise<DeletedUserResponseDto> {
    const user = await this.repository.findUniqueDeletedUser(dto);
    if (!user) throw new NotFoundException(`Deleted user ${dto.id} not found`);

    return toDeletedUserDto(user);
  }

  public async findAnyUserByIdOrFail(dto: FindUserByIdInputDto): Promise<AnyUserResponseDto> {
    const user = await this.repository.findUniqueAnyUser(dto);
    if (!user) throw new NotFoundException(`User ${dto.id} not found`);

    return toAnyUserDto(user);
  }

  public async findManyUsers(dto: FindManyUsersByIdInputDto): Promise<ActiveUsersResponseDto> {
    const users = await this.repository.findManyActiveUsers({
      where: {
        id: { in: dto.ids },
      },
    });

    return toActiveUsersDto(users);
  }

  public async findManyDeletedUsers(dto: FindManyUsersByIdInputDto): Promise<DeletedUsersResponseDto> {
    const users = await this.repository.findManyDeletedUsers({
      where: {
        id: { in: dto.ids },
      },
    });

    return toDeletedUsersDto(users);
  }

  public async findManyAnyUsers(dto: FindManyUsersByIdInputDto): Promise<AnyUsersResponseDto> {
    const users = await this.repository.findManyAnyUsers({
      where: {
        id: { in: dto.ids },
      },
    });

    return toAnyUsersDto(users);
  }
}
