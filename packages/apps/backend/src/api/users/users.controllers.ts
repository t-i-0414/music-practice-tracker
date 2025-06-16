import { ApiController } from '@/common/decorators/api-controller.decorator';
import {
  CreateUserDto,
  DeleteUserByIdDto,
  FindUserByIdDto,
  UpdateUserDto,
  UserResponseDto,
} from '@/services/user/user.dto';
import { UserService } from '@/services/user/user.service';
import { Body, Delete, Get, Param, Post, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@ApiController('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(body);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserById(@Param() params: FindUserByIdDto): Promise<UserResponseDto | null> {
    return this.userService.findUserById(params);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserById(@Param() params: FindUserByIdDto, @Body() body: UpdateUserDto): Promise<UserResponseDto> {
    return this.userService.updateUserById({
      findUserByIdDto: params,
      updateUserDto: body,
    });
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUserById(@Param() params: DeleteUserByIdDto): Promise<void> {
    await this.userService.deleteUserById(params);
  }
}
