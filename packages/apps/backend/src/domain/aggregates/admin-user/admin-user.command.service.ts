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
} from './utils/dto';

import { RepositoryService } from '@/repository/repository.service';

@Injectable()
export class AdminUserCommandService {
  public constructor(private readonly repository: RepositoryService) {}

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
    return toAdminUserResponseDto(
      await this.repository.adminUser.update({
        where: { publicId },
        data,
      }),
    );
  }

  public async deleteAdminUserById({ publicId }: DeleteAdminUserByIdInputDto): Promise<void> {
    await this.repository.adminUser.delete({ where: { publicId } });
  }

  public async deleteManyAdminUsersByIds({ publicIds }: DeleteManyAdminUsersInputDto): Promise<void> {
    await this.repository.adminUser.deleteMany({
      where: { publicId: { in: publicIds } },
    });
  }
}
