import { Injectable } from '@nestjs/common';

import {
  FindManyAdminUsersByIdInputDto,
  FindAdminUserByIdInputDto,
  toAdminUsersResponseDto,
  AdminUserResponseDto,
  AdminUsersResponseDto,
  toAdminUserResponseDto,
} from './utils/dto';

import { AdminUser, Prisma } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';

@Injectable()
export class AdminUserQueryService {
  public constructor(private readonly repository: RepositoryService) {}

  public async findUniqueOrThrowAdminUser({ publicId }: FindAdminUserByIdInputDto): Promise<AdminUserResponseDto> {
    return toAdminUserResponseDto(
      await this.repository.adminUser.findUniqueOrThrow({
        where: {
          publicId,
        },
      }),
    );
  }

  public async findManyAdminUsersById({ publicIds }: FindManyAdminUsersByIdInputDto): Promise<AdminUsersResponseDto> {
    return toAdminUsersResponseDto(
      await this.repository.adminUser.findMany({
        where: {
          publicId: { in: publicIds },
        },
      }),
    );
  }

  public async findAllAdminUsers(): Promise<AdminUsersResponseDto> {
    return toAdminUsersResponseDto(
      await this.findManyAdminUsersByFilter({
        orderBy: {
          createdAt: 'desc',
        },
      }),
    );
  }

  public async findManyAdminUsersByFilter(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AdminUserWhereUniqueInput;
    where?: Prisma.AdminUserWhereInput;
    orderBy?: Prisma.AdminUserOrderByWithRelationInput;
  }): Promise<AdminUser[]> {
    return this.repository.adminUser.findMany({
      ...params,
    });
  }
}
