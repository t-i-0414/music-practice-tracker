import { ApiController } from '@/common/decorators/api-controller.decorator';
import { User as UserModel } from '@/generated/prisma';
import { UserService } from '@/services/user/user.service';
import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

@ApiController('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async createUser(@Body() data: { name: string; email: string }): Promise<UserModel> {
    return this.userService.createUser(data);
  }

  @Get('/:id')
  async findUserById(@Param('id') id: string): Promise<UserModel | null> {
    return this.userService.findUserById(Number(id));
  }

  @Put('/:id')
  async updateUserById(@Param('id') id: string, @Body() data: Partial<Omit<UserModel, 'id'>>): Promise<UserModel> {
    return this.userService.updateUserById({
      id: Number(id),
      data,
    });
  }

  @Delete('/:id')
  async deleteUserById(@Param('id') id: string): Promise<UserModel> {
    return this.userService.deleteUserById(Number(id));
  }
}
