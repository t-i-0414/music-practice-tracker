import { Injectable, NotFoundException } from '@nestjs/common';

import { FindManyAdminUsersByIdInputDto, FindAdminUserByIdInputDto , toAdminUserResponseDto, toAdminUsersResponseDto, AdminUserResponseDto, AdminUsersResponseDto } from './dto';

import { AdminUser, Prisma } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

export type { AdminUser, AdminRole as AdminRoleEnumType, AdminStatus as AdminStatusEnumType } from '@/generated/prisma';

@Injectable()
export class AdminUserQueryService {
  public constructor(private readonly repository: RepositoryService) {}

  // Query service methods
  public async findAdminUserByIdOrFail(dto: FindAdminUserByIdInputDto): Promise<AdminUserResponseDto> {
    const adminUser = await this.findUniqueAdminUser(dto);
    if (!adminUser) throw new NotFoundException(`AdminUser ${dto.publicId} not found`);

    return toAdminUserResponseDto(adminUser);
  }

  public async findManyAdminUsers(dto: FindManyAdminUsersByIdInputDto): Promise<AdminUsersResponseDto> {
    const adminUsers = await this.findManyAdminUsersByFilter({
      where: {
        publicId: { in: dto.publicIds },
      },
    });

    return toAdminUsersResponseDto(adminUsers);
  }

  public async findAllAdminUsers(): Promise<AdminUsersResponseDto> {
    const adminUsers = await this.findManyAdminUsersByFilter({});
    return toAdminUsersResponseDto(adminUsers);
  }

  // Repository methods
  public async findUniqueAdminUser(params: Prisma.AdminUserWhereUniqueInput): Promise<AdminUser | null> {
    return this.repository.adminUser.findUnique({
      where: {
        ...params,
      },
    });
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
      where: {
        ...params.where,
      },
    });
  }
}
