import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiStandardResponses } from '@/apis/utils/api-standard-response';
import { ApiController } from '@/apis/utils/controllers/api.controller';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  FindManyUsersByIdInputDto,
  UpdateUserDataDto,
  UserResponseDto,
  UsersResponseDto,
} from '@/domain/aggregates/user/utils/dto';
import { BulkDeleteUsersService } from '@/domain/usecases/user/bulk-delete-users.service';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';
import { UpdateUserService } from '@/domain/usecases/user/update-user.service';

@ApiTags('users')
@ApiController('users')
export class AdminApiUsersController {
  public constructor(
    private readonly userQuery: UserQueryService,
    private readonly userCommand: UserCommandService,
    private readonly bulkDeleteUsersService: BulkDeleteUsersService,
    private readonly deleteUserService: DeleteUserService,
    private readonly updateUserService: UpdateUserService,
  ) {}

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
  @ApiStandardResponses()
  public async findManyUsersById(@Query() query: FindManyUsersByIdInputDto): Promise<UsersResponseDto> {
    return this.userQuery.findManyUsersById({ publicIds: query.publicIds });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserInputDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: UserResponseDto })
  @ApiStandardResponses()
  public async createUser(@Body() body: CreateUserInputDto): Promise<UserResponseDto> {
    return this.userCommand.createUser(body);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete multiple users by public IDs (Firebase + DB)' })
  @ApiBody({ type: DeleteManyUsersInputDto })
  @ApiResponse({ status: 204, description: 'Users deleted' })
  @ApiStandardResponses()
  public async deleteManyUsersById(@Body() body: DeleteManyUsersInputDto): Promise<void> {
    await this.bulkDeleteUsersService.execute(body.publicIds);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple users' })
  @ApiBody({ type: CreateManyUsersInputDto })
  @ApiResponse({ status: 201, description: 'Users created successfully', type: UsersResponseDto })
  @ApiStandardResponses()
  public async createManyAndReturnUsers(@Body() body: CreateManyUsersInputDto): Promise<UsersResponseDto> {
    return this.userCommand.createManyAndReturnUsers(body);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiStandardResponses()
  public async findUniqueOrThrowUserById(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
  ): Promise<UserResponseDto> {
    return this.userQuery.findUniqueOrThrowUserById({ publicId });
  }

  @Put(':publicId')
  @ApiOperation({ summary: 'Update a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateUserDataDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiStandardResponses()
  public async updateUserById(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() data: UpdateUserDataDto,
  ): Promise<UserResponseDto> {
    return this.updateUserService.execute(publicId, data);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by public ID (Firebase + DB)' })
  @ApiParam({ name: 'publicId', description: 'User public ID' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiStandardResponses()
  public async deleteUserById(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<void> {
    await this.deleteUserService.execute(publicId);
  }
}
