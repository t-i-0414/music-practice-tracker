import { Injectable } from '@nestjs/common';

import { AdminUserCommandService } from './admin-user.command.service';
import {
  CreateManyAdminUsersInputDto,
  CreateAdminUserInputDto,
  FindManyAdminUsersByIdInputDto,
  FindAdminUserByIdInputDto,
  DeleteManyAdminUsersInputDto,
  DeleteAdminUserByIdInputDto,
  UpdateAdminUserInputDto,
} from './admin-user.input.dto';
import { AdminUserQueryService } from './admin-user.query.service';
import { AdminUserResponseDto, AdminUsersResponseDto } from './admin-user.response.dto';

@Injectable()
export class AdminUserAdminFacadeService {
  public constructor(
    private readonly adminUserCommandService: AdminUserCommandService,
    private readonly adminUserQueryService: AdminUserQueryService,
  ) {}

  public async findAdminUserById(dto: FindAdminUserByIdInputDto): Promise<AdminUserResponseDto> {
    return this.adminUserQueryService.findAdminUserByIdOrFail(dto);
  }

  public async findManyAdminUsers(dto: FindManyAdminUsersByIdInputDto): Promise<AdminUsersResponseDto> {
    return this.adminUserQueryService.findManyAdminUsers(dto);
  }

  public async findAllAdminUsers(): Promise<AdminUsersResponseDto> {
    return this.adminUserQueryService.findAllAdminUsers();
  }

  public async createAdminUser(dto: CreateAdminUserInputDto): Promise<AdminUserResponseDto> {
    return this.adminUserCommandService.createAdminUser(dto);
  }

  public async createManyAndReturnAdminUsers(dto: CreateManyAdminUsersInputDto): Promise<AdminUsersResponseDto> {
    return this.adminUserCommandService.createManyAndReturnAdminUsers(dto);
  }

  public async updateAdminUserById(dto: UpdateAdminUserInputDto): Promise<AdminUserResponseDto> {
    return this.adminUserCommandService.updateAdminUserById(dto);
  }

  public async deleteAdminUserById({ publicId }: DeleteAdminUserByIdInputDto): Promise<void> {
    await this.adminUserCommandService.deleteAdminUserById({ publicId });
  }

  public async deleteManyAdminUsersById({ publicIds }: DeleteManyAdminUsersInputDto): Promise<void> {
    await this.adminUserCommandService.deleteManyAdminUsersById({ publicIds });
  }
}
