import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiStandardResponses } from '@/apis/utils/api-default-response';
import { ApiController } from '@/apis/utils/controllers/api.controller';
import { Public } from '@/apis/utils/decorators/public.decorator';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { CreateUserInputDto, UpdateUserDataDto, UserResponseDto } from '@/domain/aggregates/user/utils/dto';

@ApiTags('users')
@ApiController('users')
export class AppApiUsersController {
  public constructor(
    private readonly userQuery: UserQueryService,
    private readonly userCommand: UserCommandService,
  ) {}

  @Get(':publicId')
  @Public()
  @ApiOperation({ summary: 'Get a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiStandardResponses()
  public async findUniqueOrThrowUserById(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
  ): Promise<UserResponseDto> {
    return this.userQuery.findUniqueOrThrowUserById({ publicId });
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserInputDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: UserResponseDto })
  @ApiStandardResponses()
  public async createUser(@Body() body: CreateUserInputDto): Promise<UserResponseDto> {
    return this.userCommand.createUser(body);
  }

  @Put(':publicId')
  @Public()
  @ApiOperation({ summary: 'Update a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateUserDataDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiStandardResponses()
  public async updateUserById(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() data: UpdateUserDataDto,
  ): Promise<UserResponseDto> {
    return this.userCommand.updateUserById({ publicId, data });
  }

  @Delete(':publicId')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiStandardResponses()
  public async deleteUserById(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<void> {
    await this.userCommand.deleteUserById({ publicId });
  }
}
