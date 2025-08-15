import { Injectable, NotFoundException } from '@nestjs/common';

import { FindManyAdminUsersByIdInputDto, FindAdminUserByIdInputDto } from './admin-user.input.dto';
import { AdminUserRepositoryService } from './admin-user.repository.service';
import {
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
  AdminUserResponseDto,
  AdminUsersResponseDto,
} from './admin-user.response.dto';

@Injectable()
export class AdminUserQueryService {
  public constructor(private readonly repository: AdminUserRepositoryService) {}

  public async findAdminUserByIdOrFail(dto: FindAdminUserByIdInputDto): Promise<AdminUserResponseDto> {
    const adminUser = await this.repository.findUniqueAdminUser(dto);
    if (!adminUser) throw new NotFoundException(`AdminUser ${dto.publicId} not found`);

    return toAdminUserResponseDto(adminUser);
  }

  public async findManyAdminUsers(dto: FindManyAdminUsersByIdInputDto): Promise<AdminUsersResponseDto> {
    const adminUsers = await this.repository.findManyAdminUsers({
      where: {
        publicId: { in: dto.publicIds },
      },
    });

    return toAdminUsersResponseDto(adminUsers);
  }

  public async findAllAdminUsers(): Promise<AdminUsersResponseDto> {
    const adminUsers = await this.repository.findManyAdminUsers({});
    return toAdminUsersResponseDto(adminUsers);
  }
}
