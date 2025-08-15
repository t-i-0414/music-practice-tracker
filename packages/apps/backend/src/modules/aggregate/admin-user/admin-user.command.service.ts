import { Injectable } from '@nestjs/common';

import {
  CreateManyAdminUsersInputDto,
  CreateAdminUserInputDto,
  DeleteManyAdminUsersInputDto,
  DeleteAdminUserByIdInputDto,
  UpdateAdminUserInputDto,
} from './admin-user.input.dto';
import { AdminUserQueryService } from './admin-user.query.service';
import { AdminUserRepositoryService } from './admin-user.repository.service';
import {
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
  AdminUserResponseDto,
  AdminUsersResponseDto,
} from './admin-user.response.dto';

@Injectable()
export class AdminUserCommandService {
  public constructor(
    private readonly repository: AdminUserRepositoryService,
    private readonly queryService: AdminUserQueryService,
  ) {}

  public async createAdminUser(dto: CreateAdminUserInputDto): Promise<AdminUserResponseDto> {
    return toAdminUserResponseDto(await this.repository.createAdminUser(dto));
  }

  public async createManyAndReturnAdminUsers({
    adminUsers,
  }: CreateManyAdminUsersInputDto): Promise<AdminUsersResponseDto> {
    const createdAdminUsers = await this.repository.createManyAndReturnAdminUsers(adminUsers);
    return toAdminUsersResponseDto(createdAdminUsers);
  }

  public async updateAdminUserById({ publicId, data }: UpdateAdminUserInputDto): Promise<AdminUserResponseDto> {
    await this.queryService.findAdminUserByIdOrFail({ publicId });

    return toAdminUserResponseDto(
      await this.repository.updateAdminUser({
        where: { publicId },
        data,
      }),
    );
  }

  public async deleteAdminUserById({ publicId }: DeleteAdminUserByIdInputDto): Promise<void> {
    await this.queryService.findAdminUserByIdOrFail({ publicId });
    await this.repository.deleteAdminUser({ publicId });
  }

  public async deleteManyAdminUsersById({ publicIds }: DeleteManyAdminUsersInputDto): Promise<void> {
    await this.repository.deleteManyAdminUsers({
      publicId: { in: publicIds },
    });
  }
}
