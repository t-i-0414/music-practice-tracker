import { Body, Controller, Get, Post } from '@nestjs/common';
import { User as UserModel } from '../generated/prisma';
import { UsersService } from './user.service';

@Controller()
export class AppController {
  constructor(private readonly userService: UsersService) {}

  @Post('user')
  async signupUser(
    @Body() userData: { name: string; email: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Get('users')
  async getUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  @Get('users/:id')
  async getUser(@Body() userId: { id: number }): Promise<UserModel | null> {
    return this.userService.user({ id: userId.id });
  }
}
