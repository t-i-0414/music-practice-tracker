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

import { RepositoryService } from '@/repository/service';

@Injectable()
export class AdminUserCommandService {
  public constructor(
    private readonly repository: RepositoryService,
    private readonly queryService: AdminUserQueryService,
  ) {}

  public async createAdminUser(dto: CreateAdminUserInputDto): Promise<AdminUserResponseDto> {
    return toAdminUserResponseDto(
      await this.repository.adminUser.create({
        data: dto,
      }),
    );
  }

  public async createManyAndReturnAdminUsers({
    adminUsers,
  }: CreateManyAdminUsersInputDto): Promise<AdminUsersResponseDto> {
    return toAdminUsersResponseDto(
      await this.repository.adminUser.createManyAndReturn({
        data: adminUsers,
      }),
    );
  }

  public async updateAdminUserById({ publicId, data }: UpdateAdminUserInputDto): Promise<AdminUserResponseDto> {
    await this.queryService.findUniqueOrThrowAdminUser({ publicId });

    return toAdminUserResponseDto(
      await this.repository.adminUser.update({
        where: { publicId },
        data,
      }),
    );
  }

  public async deleteAdminUserById({ publicId }: DeleteAdminUserByIdInputDto): Promise<void> {
    await this.queryService.findUniqueOrThrowAdminUser({ publicId });
    await this.repository.adminUser.delete({ where: { publicId } });
  }

  public async deleteManyAdminUsersByIds({ publicIds }: DeleteManyAdminUsersInputDto): Promise<void> {
    await this.repository.adminUser.deleteMany({
      where: { publicId: { in: publicIds } },
    });
  }
}
