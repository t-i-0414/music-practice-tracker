import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserAuthGuard } from '../utils/guards/user-auth.guard';

import { CurrentUser, type CurrentUserData } from '@/apis/app/utils/decorators/current-user.decorator'
import { ApiStandardResponses } from '@/apis/utils/api-default-response';
import { ApiController } from '@/apis/utils/controllers/api.controller';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { CreateUserInputDto, UpdateUserDataDto, UserResponseDto } from '@/domain/aggregates/user/utils/dto';

@ApiTags('users')
@UseGuards(UserAuthGuard)
@ApiController('users')
export class AppApiUsersController {
  public constructor(
    private readonly userQuery: UserQueryService,
    private readonly userCommand: UserCommandService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUserInputDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: UserResponseDto })
  @ApiStandardResponses()
  public async createUser(@Body() body: CreateUserInputDto): Promise<UserResponseDto> {
    return this.userCommand.createUser(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user information', type: UserResponseDto })
  @ApiStandardResponses()
  public me(@CurrentUser() user: CurrentUserData): Promise<UserResponseDto> {
    return this.userQuery.findUniqueOrThrowUserById({ publicId: user.publicId });
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDataDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiStandardResponses()
  public async updateCurrentUserProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() data: UpdateUserDataDto,
  ): Promise<UserResponseDto> {
    return this.userCommand.updateUserById({ publicId: user.publicId, data });
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiStandardResponses()
  public async deleteUserById(@CurrentUser() user: CurrentUserData): Promise<void> {
    await this.userCommand.deleteUserById({ publicId: user.publicId });
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
}
