import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AdminUserCommandService } from '@/aggregates/admin-user/command.service';
import {
  CreateManyAdminUsersInputDto,
  CreateAdminUserInputDto,
  DeleteManyAdminUsersInputDto,
  UpdateAdminUserDataInputDto,
 AdminUserResponseDto, AdminUsersResponseDto } from '@/aggregates/admin-user/dto';
import { AdminUserQueryService } from '@/aggregates/admin-user/query.service';
import { ApiController } from '@/decorators/api-controller/decorator';
import { ensurePublicIdsToArray } from '@/utils/ensure-public-ids-to-array';

@ApiTags('admin-users')
@ApiController('admin-users')
export class AdminAdminUsersController {
  public constructor(
    private readonly adminUserQuery: AdminUserQueryService,
    private readonly adminUserCommand: AdminUserCommandService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get admin users by public IDs or all admin users' })
  @ApiQuery({
    name: 'publicIds',
    description: 'List of admin user public IDs (optional)',
    type: String,
    isArray: true,
    style: 'form',
    explode: true,
    required: false,
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7891-e89b-12d3-a456-426614174000'],
  })
  @ApiResponse({ status: 200, description: 'Admin users found', type: AdminUsersResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin users not found' })
  public async findManyAdminUsers(@Query('publicIds') publicIds?: string | string[]): Promise<AdminUsersResponseDto> {
    if (publicIds !== undefined) {
      return this.adminUserQuery.findManyAdminUsers({ publicIds: ensurePublicIdsToArray(publicIds) });
    }
    return this.adminUserQuery.findAllAdminUsers();
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get an admin user by public ID' })
  @ApiParam({ name: 'publicId', description: 'Admin user public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Admin user found', type: AdminUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin user not found' })
  public async findAdminUserById(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
  ): Promise<AdminUserResponseDto> {
    return this.adminUserQuery.findAdminUserByIdOrFail({ publicId });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateAdminUserInputDto })
  @ApiResponse({
    status: 201,
    description: 'The admin user has been successfully created.',
    type: AdminUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  public async createAdminUser(@Body() body: CreateAdminUserInputDto): Promise<AdminUserResponseDto> {
    return this.adminUserCommand.createAdminUser(body);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple admin users' })
  @ApiBody({ type: CreateManyAdminUsersInputDto })
  @ApiResponse({ status: 201, description: 'Admin users created successfully', type: AdminUsersResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  public async createManyAdminUsers(@Body() body: CreateManyAdminUsersInputDto): Promise<AdminUsersResponseDto> {
    return this.adminUserCommand.createManyAndReturnAdminUsers(body);
  }

  @Put(':publicId')
  @ApiOperation({ summary: 'Update an admin user by public ID' })
  @ApiParam({ name: 'publicId', description: 'Admin user public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateAdminUserDataInputDto })
  @ApiResponse({ status: 200, description: 'Admin user updated successfully', type: AdminUserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin user not found' })
  public async updateAdminUser(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() data: UpdateAdminUserDataInputDto,
  ): Promise<AdminUserResponseDto> {
    return this.adminUserCommand.updateAdminUserById({ publicId, data });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple admin users by public IDs' })
  @ApiBody({ type: DeleteManyAdminUsersInputDto })
  @ApiResponse({ status: 204, description: 'Admin users deleted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteManyAdminUsers(@Body() body: DeleteManyAdminUsersInputDto): Promise<void> {
    await this.adminUserCommand.deleteManyAdminUsersById(body);
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete an admin user by public ID' })
  @ApiParam({ name: 'publicId', description: 'Admin user public ID' })
  @ApiResponse({ status: 204, description: 'Admin user deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin user not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteAdminUser(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<void> {
    await this.adminUserCommand.deleteAdminUserById({ publicId });
  }
}
