import { Injectable, NotFoundException } from '@nestjs/common';

import {
  FindManyUsersByIdInputDto,
  FindUserByIdInputDto,
  toUserResponseDto,
  toUsersResponseDto,
  UserResponseDto,
  UsersResponseDto,
} from './dto';

import { Prisma, User } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

export type { User, UserStatus as UserStatusEnumType } from '@/generated/prisma';

@Injectable()
export class UserQueryService {
  public constructor(private readonly repository: RepositoryService) {}

  // Query service methods
  public async findUserByIdOrFail(dto: FindUserByIdInputDto): Promise<UserResponseDto> {
    const user = await this.findUniqueUser(dto);
    if (!user) throw new NotFoundException(`User ${dto.publicId} not found`);

    return toUserResponseDto(user);
  }

  public async findManyUsers(dto: FindManyUsersByIdInputDto): Promise<UsersResponseDto> {
    const users = await this.findManyUsersByFilter({
      where: {
        publicId: { in: dto.publicIds },
      },
    });

    return toUsersResponseDto(users);
  }

  // Repository methods
  public async findUniqueUser(params: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.repository.user.findUnique({
      where: {
        ...params,
      },
    });
  }

  public async findManyUsersByFilter(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return this.repository.user.findMany({
      ...params,
      where: {
        ...params.where,
      },
    });
  }

  public async findUniqueUserByEmail(email: string): Promise<User | null> {
    return this.repository.user.findUnique({
      where: { email },
    });
  }

  public async findFirstUserByOAuthProvider(provider: 'google' | 'apple', providerId: string): Promise<User | null> {
    const whereClause: Prisma.UserWhereInput = {};
    if (provider === 'google') {
      whereClause.googleId = providerId;
    } else {
      whereClause.appleId = providerId;
    }

    return this.repository.user.findFirst({
      where: whereClause,
    });
  }
}
