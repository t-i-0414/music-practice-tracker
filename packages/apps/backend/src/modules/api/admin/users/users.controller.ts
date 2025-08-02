import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiController } from '@/decorators/api-controller.decorator';
import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  UpdateUserDataDto,
} from '@/modules/aggregate/user/user.input.dto';
import { UserResponseDto, UsersResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { ensurePublicIdsToArray } from '@/utils/ensure-public-ids-to-array';

@ApiTags('users')
@ApiController('users')
export class AdminUsersController {
  public constructor(private readonly userAdminFacade: UserAdminFacadeService) {}

  @Get()
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
  @ApiResponse({ status: 200, description: 'Users found', type: UsersResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Users not found' })
  public async findManyUsers(@Query('publicIds') publicIds: string | string[]): Promise<UsersResponseDto> {
    return this.userAdminFacade.findManyUsers({ publicIds: ensurePublicIdsToArray(publicIds) });
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findUserById(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<UserResponseDto> {
    return this.userAdminFacade.findUserById({ publicId });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserInputDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  public async createUser(@Body() body: CreateUserInputDto): Promise<UserResponseDto> {
    return this.userAdminFacade.createUser(body);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple users' })
  @ApiBody({ type: CreateManyUsersInputDto })
  @ApiResponse({ status: 201, description: 'Users created successfully', type: UsersResponseDto })
  public async createManyUsers(@Body() body: CreateManyUsersInputDto): Promise<UsersResponseDto> {
    return this.userAdminFacade.createManyAndReturnUsers(body);
  }

  @Put(':publicId')
  @ApiOperation({ summary: 'Update a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateUserDataDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  public async updateUser(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() data: UpdateUserDataDto,
  ): Promise<UserResponseDto> {
    return this.userAdminFacade.updateUserById({ publicId, data });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple users by public IDs' })
  @ApiBody({ type: DeleteManyUsersInputDto })
  @ApiResponse({ status: 204, description: 'Users deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteManyUsers(@Body() body: DeleteManyUsersInputDto): Promise<void> {
    return this.userAdminFacade.deleteManyUsersById(body);
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<void> {
    return this.userAdminFacade.deleteUserById({ publicId });
  }
}
