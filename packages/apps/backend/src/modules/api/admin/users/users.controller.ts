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
import { ensurePublicIdsToArray } from '@/utils/ensure-public-ids-to-array';

@ApiTags('users')
@ApiController('users')
export class AdminUsersController {
  public constructor(private readonly userAdminFacade: UserAdminFacadeService) {}

  @Get('active_users')
  @ApiOperation({ summary: 'Get users by public IDs' })
  @ApiQuery({
    name: 'publicIds',
    description: 'List of user public IDs',
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
  public async findManyUsers(@Query('publicIds') publicIds: string | string[]): Promise<ActiveUsersResponseDto> {
    return this.userAdminFacade.findManyUsers({ publicIds: ensurePublicIdsToArray(publicIds) });
  }

  @Get('active_users/:publicId')
  @ApiOperation({ summary: 'Get user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: ActiveUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findUserById(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<ActiveUserResponseDto> {
    return this.userAdminFacade.findUserById({ publicId });
  }

  @Get('deleted_users')
  @ApiOperation({ summary: 'Get users by public IDs' })
  @ApiQuery({
    name: 'publicIds',
    description: 'List of user public IDs',
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
  public async findManyDeletedUsers(
    @Query('publicIds') publicIds: string | string[],
  ): Promise<DeletedUsersResponseDto> {
    return this.userAdminFacade.findManyDeletedUsers({ publicIds: ensurePublicIdsToArray(publicIds) });
  }

  @Get('deleted_users/:publicId')
  @ApiOperation({ summary: 'Get user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: DeletedUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findDeletedUserById(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
  ): Promise<DeletedUserResponseDto> {
    return this.userAdminFacade.findDeletedUserById({ publicId });
  }

  @Get('any_users')
  @ApiOperation({ summary: 'Get users by public IDs' })
  @ApiQuery({
    name: 'publicIds',
    description: 'List of user public IDs',
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
  public async findManyAnyUsers(@Query('publicIds') publicIds: string | string[]): Promise<AnyUsersResponseDto> {
    return this.userAdminFacade.findManyAnyUsers({ publicIds: ensurePublicIdsToArray(publicIds) });
  }

  @Get('any_users/:publicId')
  @ApiOperation({ summary: 'Get user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: AnyUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findAnyUserById(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<AnyUserResponseDto> {
    return this.userAdminFacade.findAnyUserById({ publicId });
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

  @Put(':publicId')
  @ApiOperation({ summary: 'Update a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateUserDataDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: ActiveUserResponseDto })
  public async updateUser(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() data: UpdateUserDataDto,
  ): Promise<ActiveUserResponseDto> {
    return this.userAdminFacade.updateUserById({ publicId, data });
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple users by public IDs (soft)' })
  @ApiBody({ type: DeleteManyUsersInputDto })
  @ApiResponse({ status: 204, description: 'Users deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteManyUsers(@Body() body: DeleteManyUsersInputDto): Promise<void> {
    return this.userAdminFacade.deleteManyUsersById(body);
  }

  @Delete('hard/bulk')
  @ApiOperation({ summary: 'Hard delete multiple users by public IDs' })
  @ApiBody({ type: HardDeleteManyUsersInputDto })
  @ApiResponse({ status: 204, description: 'Users permanently deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async hardDeleteManyUsers(@Body() body: HardDeleteManyUsersInputDto): Promise<void> {
    return this.userAdminFacade.hardDeleteManyUsersById(body);
  }

  @Delete('hard/:publicId')
  @ApiOperation({ summary: 'Hard delete a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID' })
  @ApiResponse({ status: 204, description: 'User permanently deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async hardDeleteUser(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<void> {
    return this.userAdminFacade.hardDeleteUserById({ publicId });
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete a user by public ID (soft)' })
  @ApiParam({ name: 'publicId', description: 'User public ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<void> {
    return this.userAdminFacade.deleteUserById({ publicId });
  }

  @Put('restore/bulk')
  @ApiOperation({ summary: 'Restore multiple soft-deleted users by public IDs' })
  @ApiBody({
    type: RestoreManyUsersInputDto,
    description: 'IDs of users to be restored',
    examples: {
      example: {
        summary: 'Restore users by public IDs',
        value: { publicIds: ['123e4567-e89b-12d3-a456-426614174000', '456e7891-e89b-12d3-a456-426614174000'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Users restored successfully', type: ActiveUsersResponseDto })
  public async restoreManyUsers(@Body() body: RestoreManyUsersInputDto): Promise<ActiveUsersResponseDto> {
    return this.userAdminFacade.restoreManyUsersById(body);
  }

  @Put(':publicId/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID' })
  @ApiResponse({ status: 200, description: 'User restored successfully', type: ActiveUserResponseDto })
  public async restoreUser(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<ActiveUserResponseDto> {
    return this.userAdminFacade.restoreUserById({ publicId });
  }
}
