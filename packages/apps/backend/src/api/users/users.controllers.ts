import { ApiController } from '@/common/decorators/api-controller.decorator';
import { User as UserModel } from '@/generated/prisma';
import { UserService } from '@/services/user/user.service';
import { Body, Get, Post } from '@nestjs/common';

@ApiController('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  @Post('/create')
  async createUser(@Body() userData: { name: string; email: string }): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Get('/:id')
  async getUser(@Body() userId: { id: number }): Promise<UserModel | null> {
    return this.userService.user({ id: userId.id });
  }
}
