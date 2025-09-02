import { Injectable } from '@nestjs/common';

import {
  FindManyUsersByIdInputDto,
  FindUserByIdInputDto,
  toUserResponseDto,
  toUsersResponseDto,
  UserResponseDto,
  UsersResponseDto,
} from './utils/dto';

import { RepositoryService } from '@/repository/repository.service';

@Injectable()
export class UserQueryService {
  public constructor(private readonly repository: RepositoryService) {}

  /**
   * Find a user by publicId or fail with error
   */
  public async findUniqueOrThrowUserById(dto: FindUserByIdInputDto): Promise<UserResponseDto> {
    return toUserResponseDto(
      await this.repository.user.findUniqueOrThrow({
        where: {
          publicId: dto.publicId,
        },
      }),
    );
  }

  /**
   * Find a user by email
   */
  public async findUniqueOrThrowUserByEmail(email: string): Promise<UserResponseDto> {
    return toUserResponseDto(
      await this.repository.user.findUniqueOrThrow({
        where: {
          email,
        },
      }),
    );
  }

  /**
   * Find multiple users by publicIds
   */
  public async findManyUsersById(dto: FindManyUsersByIdInputDto): Promise<UsersResponseDto> {
    return toUsersResponseDto(
      await this.repository.user.findMany({
        where: {
          publicId: {
            in: dto.publicIds,
          },
        },
      }),
    );
  }
}
