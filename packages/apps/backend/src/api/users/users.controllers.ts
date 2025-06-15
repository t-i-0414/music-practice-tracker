import { ApiController } from '@/common/decorators/api-controller.decorator';
import { User as UserModel } from '@/generated/prisma';
import { CreateUserDto, DeleteUserByIdDto, FindUserByIdDto, UpdateUserDto } from '@/services/user/user.dto';
import { UserService } from '@/services/user/user.service';
import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

@ApiController('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async createUser(@Body() body: CreateUserDto): Promise<UserModel> {
    return this.userService.createUser(body);
  }

  @Get('/:id')
  async findUserById(@Param() params: FindUserByIdDto): Promise<UserModel | null> {
    return this.userService.findUserById(params);
  }

  @Put('/:id')
  async updateUserById(@Param() params: FindUserByIdDto, @Body() body: UpdateUserDto): Promise<UserModel> {
    return this.userService.updateUserById({
      findUserByIdDto: params,
      updateUserDto: body,
    });
  }

  @Delete('/:id')
  async deleteUserById(@Param() params: DeleteUserByIdDto): Promise<UserModel> {
    return this.userService.deleteUserById(params);
  }
}
