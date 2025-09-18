import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiStandardResponses } from '@/apis/utils/api-default-response';
import { ApiController } from '@/apis/utils/controllers/api.controller';
import { AdminUserCommandService } from '@/domain/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
import {
  CreateManyAdminUsersInputDto,
  CreateAdminUserInputDto,
  DeleteManyAdminUsersInputDto,
  UpdateAdminUserInputData,
  AdminUserResponseDto,
  AdminUsersResponseDto,
  FindManyAdminUsersByIdInputDto,
} from '@/domain/aggregates/admin-user/utils/dto';
import { ensurePublicIdsToArray } from '@/utils/ensure-public-ids-to-array';

@ApiTags('admin-users')
@ApiController('admin-users')
export class AdminApiAdminUsersController {
  public constructor(
    private readonly adminUserQuery: AdminUserQueryService,
    private readonly adminUserCommand: AdminUserCommandService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get admin users by public IDs' })
  @ApiQuery({
    name: 'publicIds',
    description: 'List of admin user public IDs',
    type: String,
    isArray: true,
    style: 'form',
    explode: true,
    required: false,
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7891-e89b-12d3-a456-426614174000'],
  })
  @ApiResponse({ status: 200, description: 'Admin users found', type: AdminUsersResponseDto })
  @ApiStandardResponses()
  public findManyAdminUsers(@Query() { publicIds }: FindManyAdminUsersByIdInputDto): Promise<AdminUsersResponseDto> {
    return this.adminUserQuery.findManyAdminUsersById({ publicIds: ensurePublicIdsToArray(publicIds) });
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
  @ApiStandardResponses()
  public async createAdminUser(@Body() body: CreateAdminUserInputDto): Promise<AdminUserResponseDto> {
    return this.adminUserCommand.createAdminUser(body);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple admin users by public IDs' })
  @ApiBody({ type: DeleteManyAdminUsersInputDto })
  @ApiResponse({ status: 204, description: 'Admin users deleted' })
  @ApiStandardResponses()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteManyAdminUsers(@Body() body: DeleteManyAdminUsersInputDto): Promise<void> {
    await this.adminUserCommand.deleteManyAdminUsersByIds(body);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple admin users' })
  @ApiBody({ type: CreateManyAdminUsersInputDto })
  @ApiResponse({ status: 201, description: 'Admin users created successfully', type: AdminUsersResponseDto })
  @ApiStandardResponses()
  public async createManyAdminUsers(@Body() body: CreateManyAdminUsersInputDto): Promise<AdminUsersResponseDto> {
    return this.adminUserCommand.createManyAndReturnAdminUsers(body);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get an admin user by public ID' })
  @ApiParam({ name: 'publicId', description: 'Admin user public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Admin user found', type: AdminUserResponseDto })
  @ApiStandardResponses()
  public async findAdminUserById(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
  ): Promise<AdminUserResponseDto> {
    return this.adminUserQuery.findUniqueOrThrowAdminUser({ publicId });
  }

  @Put(':publicId')
  @ApiOperation({ summary: 'Update an admin user by public ID' })
  @ApiParam({ name: 'publicId', description: 'Admin user public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateAdminUserInputData })
  @ApiResponse({ status: 200, description: 'Admin user updated successfully', type: AdminUserResponseDto })
  @ApiStandardResponses()
  public async updateAdminUser(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() data: UpdateAdminUserInputData,
  ): Promise<AdminUserResponseDto> {
    return this.adminUserCommand.updateAdminUserById({ publicId, data });
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete an admin user by public ID' })
  @ApiParam({ name: 'publicId', description: 'Admin user public ID' })
  @ApiResponse({ status: 204, description: 'Admin user deleted' })
  @ApiStandardResponses()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteAdminUser(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<void> {
    await this.adminUserCommand.deleteAdminUserById({ publicId });
  }
}
