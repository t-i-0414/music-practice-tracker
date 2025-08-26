import { Injectable } from '@nestjs/common';

import {
  CreateManyAdminUsersInputDto,
  CreateAdminUserInputDto,
  DeleteManyAdminUsersInputDto,
  DeleteAdminUserByIdInputDto,
  UpdateAdminUserInputDto,
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
  AdminUserResponseDto,
  AdminUsersResponseDto,
} from './dto';
import { AdminUserQueryService } from './query.service';

import { AdminUser, Prisma } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

@Injectable()
export class AdminUserCommandService {
  public constructor(
    private readonly repository: RepositoryService,
    private readonly queryService: AdminUserQueryService,
  ) {}

  // Command service methods
  public async createAdminUser(dto: CreateAdminUserInputDto): Promise<AdminUserResponseDto> {
    return toAdminUserResponseDto(await this.createAdminUserRecord(dto));
  }

  public async createManyAndReturnAdminUsers({
    adminUsers,
  }: CreateManyAdminUsersInputDto): Promise<AdminUsersResponseDto> {
    const createdAdminUsers = await this.createManyAdminUserRecords(adminUsers);
    return toAdminUsersResponseDto(createdAdminUsers);
  }

  public async updateAdminUserById({ publicId, data }: UpdateAdminUserInputDto): Promise<AdminUserResponseDto> {
    await this.queryService.findAdminUserByIdOrFail({ publicId });

    return toAdminUserResponseDto(
      await this.updateAdminUser({
        where: { publicId },
        data,
      }),
    );
  }

  public async deleteAdminUserById({ publicId }: DeleteAdminUserByIdInputDto): Promise<void> {
    await this.queryService.findAdminUserByIdOrFail({ publicId });
    await this.deleteAdminUser({ publicId });
  }

  public async deleteManyAdminUsersById({ publicIds }: DeleteManyAdminUsersInputDto): Promise<void> {
    await this.deleteManyAdminUsers({
      publicId: { in: publicIds },
    });
  }

  // Repository methods
  public async createAdminUserRecord(params: Prisma.AdminUserCreateInput): Promise<AdminUser> {
    return this.repository.adminUser.create({
      data: params,
    });
  }

  public async createManyAdminUserRecords(params: Prisma.AdminUserCreateInput[]): Promise<AdminUser[]> {
    return this.repository.adminUser.createManyAndReturn({
      data: params,
    });
  }

  public async updateAdminUser(params: {
    where: Prisma.AdminUserWhereUniqueInput;
    data: Prisma.AdminUserUpdateInput;
  }): Promise<AdminUser> {
    const { where, data } = params;
    return this.repository.adminUser.update({
      data: {
        ...data,
      },
      where: {
        ...where,
      },
    });
  }

  public async deleteAdminUser(params: Prisma.AdminUserWhereUniqueInput): Promise<void> {
    await this.repository.adminUser.delete({
      where: params,
    });
  }

  public async deleteManyAdminUsers(params: Prisma.AdminUserWhereInput): Promise<void> {
    await this.repository.adminUser.deleteMany({
      where: params,
    });
  }
}
