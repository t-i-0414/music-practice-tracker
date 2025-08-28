import { Injectable, NotFoundException } from '@nestjs/common';

import {
  FindManyAdminUsersByIdInputDto,
  FindAdminUserByIdInputDto,
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
  AdminUserResponseDto,
  AdminUsersResponseDto,
} from './dto';

import { AdminUser, Prisma } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

@Injectable()
export class AdminUserQueryService {
  public constructor(private readonly repository: RepositoryService) {}

  public async findUniqueOrThrowAdminUser({ publicId }: FindAdminUserByIdInputDto): Promise<AdminUserResponseDto> {
    try {
      const adminUser = await this.repository.adminUser.findUniqueOrThrow({
        where: {
          publicId,
        },
      });

      return toAdminUserResponseDto(adminUser);
    } catch (_error) {
      throw new NotFoundException(`AdminUser ${publicId} not found`);
    }
  }

  public async findManyAdminUsers({ publicIds }: FindManyAdminUsersByIdInputDto): Promise<AdminUsersResponseDto> {
    const adminUsers = await this.repository.adminUser.findMany({
      where: {
        publicId: { in: publicIds },
      },
    });

    return toAdminUsersResponseDto(adminUsers);
  }

  public async findAllAdminUsers(): Promise<AdminUsersResponseDto> {
    const adminUsers = await this.findManyAdminUsersByFilter({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return toAdminUsersResponseDto(adminUsers);
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
