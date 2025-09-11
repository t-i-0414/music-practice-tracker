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

  public async findUniqueOrThrowUserById(dto: FindUserByIdInputDto): Promise<UserResponseDto> {
    return toUserResponseDto(
      await this.repository.user.findUniqueOrThrow({
        where: {
          publicId: dto.publicId,
        },
      }),
    );
  }

  public async findUniqueOrThrowUserByEmail(email: string): Promise<UserResponseDto> {
    return toUserResponseDto(
      await this.repository.user.findUniqueOrThrow({
        where: {
          email,
        },
      }),
    );
  }

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

  public async findUniqueOrThrowUserByFirebaseUid(firebaseUid: string): Promise<UserResponseDto> {
    return toUserResponseDto(
      await this.repository.user.findUniqueOrThrow({
        where: {
          firebaseUid,
        },
      }),
    );
  }
}
