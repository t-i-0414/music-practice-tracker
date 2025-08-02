import { Body, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiController } from '@/decorators/api-controller.decorator';
import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import { CreateUserInputDto, UpdateUserDataDto } from '@/modules/aggregate/user/user.input.dto';
import { UserResponseDto } from '@/modules/aggregate/user/user.response.dto';

@ApiTags('users')
@ApiController('users')
export class AppUsersController {
  public constructor(private readonly userAppFacade: UserAppFacadeService) {}

  @Get(':publicId')
  @ApiOperation({ summary: 'Get a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findUserById(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<UserResponseDto> {
    return this.userAppFacade.findUserById({ publicId });
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
    return this.userAppFacade.createUser(body);
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
    return this.userAppFacade.updateUserById({ publicId, data });
  }
}
