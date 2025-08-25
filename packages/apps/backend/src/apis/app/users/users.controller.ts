import { Body, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserCommandService } from '@/aggregates/user/user.command.service';
import { CreateUserInputDto, UpdateUserDataDto } from '@/aggregates/user/user.input.dto';
import { UserQueryService } from '@/aggregates/user/user.query.service';
import { UserResponseDto } from '@/aggregates/user/user.response.dto';
import { ApiController } from '@/decorators/api-controller.decorator';
import { Public } from '@/decorators/public.decorator';

@ApiTags('users')
@ApiController('users')
export class AppUsersController {
  public constructor(
    private readonly userQuery: UserQueryService,
    private readonly userCommand: UserCommandService,
  ) {}

  @Get(':publicId')
  @Public()
  @ApiOperation({ summary: 'Get a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findUserById(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<UserResponseDto> {
    return this.userQuery.findUserByIdOrFail({ publicId });
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserInputDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  public async createUser(@Body() body: CreateUserInputDto): Promise<UserResponseDto> {
    return this.userCommand.createUser(body);
  }

  @Put(':publicId')
  @Public()
  @ApiOperation({ summary: 'Update a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateUserDataDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  public async updateUser(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() data: UpdateUserDataDto,
  ): Promise<UserResponseDto> {
    return this.userCommand.updateUserById({ publicId, data });
  }
}
