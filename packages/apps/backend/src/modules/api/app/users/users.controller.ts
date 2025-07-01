import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiController } from '@/common/decorators/api-controller.decorator';
import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import { CreateUserInputDto, UpdateUserDataDto } from '@/modules/aggregate/user/user.input.dto';
import { ActiveUserResponseDto } from '@/modules/aggregate/user/user.response.dto';

@ApiTags('app/users')
@ApiController('app/users')
export class AppUsersController {
  public constructor(private readonly userAppFacade: UserAppFacadeService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: ActiveUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findUserById(@Param('id', new ParseUUIDPipe()) id: string): Promise<ActiveUserResponseDto> {
    return this.userAppFacade.findUserById({ id });
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
    return this.userAppFacade.createUser(body);
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
    return this.userAppFacade.updateUserById({ id, data });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID (soft)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.userAppFacade.deleteUserById({ id });
  }
}
