import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiController } from '@/decorators/api-controller.decorator';
import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  HardDeleteManyUsersInputDto,
  RestoreManyUsersInputDto,
  UpdateUserDataDto,
} from '@/modules/aggregate/user/user.input.dto';
import {
  ActiveUserResponseDto,
  ActiveUsersResponseDto,
  AnyUserResponseDto,
  AnyUsersResponseDto,
  DeletedUserResponseDto,
  DeletedUsersResponseDto,
} from '@/modules/aggregate/user/user.response.dto';
import { ensureIdsToArray } from '@/utils/ensure-ids-to-array';

@ApiTags('users')
@ApiController('users')
export class AdminUsersController {
  public constructor(private readonly userAdminFacade: UserAdminFacadeService) {}

  @Get('active_users')
  @ApiOperation({ summary: 'Get users by IDs' })
  @ApiQuery({
    name: 'ids',
    description: 'List of user IDs',
    type: String,
    isArray: true,
    style: 'form',
    explode: true,
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7891-e89b-12d3-a456-426614174000'],
  })
  @ApiResponse({ status: 200, description: 'Users found', type: ActiveUsersResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Users not found' })
  public async findManyUsers(@Query('ids') ids: string | string[]): Promise<ActiveUsersResponseDto> {
    return this.userAdminFacade.findManyUsers({ ids: ensureIdsToArray(ids) });
  }

  @Get('active_users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: ActiveUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findUserById(@Param('id', new ParseUUIDPipe()) id: string): Promise<ActiveUserResponseDto> {
    return this.userAdminFacade.findUserById({ id });
  }

  @Get('deleted_users')
  @ApiOperation({ summary: 'Get users by IDs' })
  @ApiQuery({
    name: 'ids',
    description: 'List of user IDs',
    type: String,
    isArray: true,
    style: 'form',
    explode: true,
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7891-e89b-12d3-a456-426614174000'],
  })
  @ApiResponse({ status: 200, description: 'Users found', type: DeletedUsersResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Users not found' })
  public async findManyDeletedUsers(@Query('ids') ids: string | string[]): Promise<DeletedUsersResponseDto> {
    return this.userAdminFacade.findManyDeletedUsers({ ids: ensureIdsToArray(ids) });
  }

  @Get('deleted_users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: DeletedUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findDeletedUserById(@Param('id', new ParseUUIDPipe()) id: string): Promise<DeletedUserResponseDto> {
    return this.userAdminFacade.findDeletedUserById({ id });
  }

  @Get('any_users')
  @ApiOperation({ summary: 'Get users by IDs' })
  @ApiQuery({
    name: 'ids',
    description: 'List of user IDs',
    type: String,
    isArray: true,
    style: 'form',
    explode: true,
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7891-e89b-12d3-a456-426614174000'],
  })
  @ApiResponse({ status: 200, description: 'Users found', type: AnyUsersResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Users not found' })
  public async findManyAnyUsers(@Query('ids') ids: string | string[]): Promise<AnyUsersResponseDto> {
    return this.userAdminFacade.findManyAnyUsers({ ids: ensureIdsToArray(ids) });
  }

  @Get('any_users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: AnyUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findAnyUserById(@Param('id', new ParseUUIDPipe()) id: string): Promise<AnyUserResponseDto> {
    return this.userAdminFacade.findAnyUserById({ id });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserInputDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: ActiveUserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  public async createUser(@Body() body: CreateUserInputDto): Promise<ActiveUserResponseDto> {
    return this.userAdminFacade.createUser(body);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple users' })
  @ApiBody({ type: CreateManyUsersInputDto })
  @ApiResponse({ status: 201, description: 'Users created successfully', type: ActiveUsersResponseDto })
  public async createManyUsers(@Body() body: CreateManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    return this.userAdminFacade.createManyAndReturnUsers(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateUserDataDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: ActiveUserResponseDto })
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateUserDataDto,
  ): Promise<ActiveUserResponseDto> {
    return this.userAdminFacade.updateUserById({ id, data });
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple users by IDs (soft)' })
  @ApiBody({ type: DeleteManyUsersInputDto })
  @ApiResponse({ status: 204, description: 'Users deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteManyUsers(@Body() body: DeleteManyUsersInputDto): Promise<void> {
    return this.userAdminFacade.deleteManyUsersById(body);
  }

  @Delete('hard/bulk')
  @ApiOperation({ summary: 'Hard delete multiple users by IDs' })
  @ApiBody({ type: HardDeleteManyUsersInputDto })
  @ApiResponse({ status: 204, description: 'Users permanently deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async hardDeleteManyUsers(@Body() body: HardDeleteManyUsersInputDto): Promise<void> {
    return this.userAdminFacade.hardDeleteManyUsersById(body);
  }

  @Delete('hard/:id')
  @ApiOperation({ summary: 'Hard delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User permanently deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async hardDeleteUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.userAdminFacade.hardDeleteUserById({ id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID (soft)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.userAdminFacade.deleteUserById({ id });
  }

  @Put('restore/bulk')
  @ApiOperation({ summary: 'Restore multiple soft-deleted users by IDs' })
  @ApiBody({
    type: RestoreManyUsersInputDto,
    description: 'IDs of users to be restored',
    examples: {
      example: {
        summary: 'Restore users by IDs',
        value: { ids: ['123e4567-e89b-12d3-a456-426614174000', '456e7891-e89b-12d3-a456-426614174000'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Users restored successfully', type: ActiveUsersResponseDto })
  public async restoreManyUsers(@Body() body: RestoreManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    return this.userAdminFacade.restoreManyUsersById(body);
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User restored successfully', type: ActiveUserResponseDto })
  public async restoreUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<ActiveUserResponseDto> {
    return this.userAdminFacade.restoreUserById({ id });
  }
}
