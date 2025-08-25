import { Module } from '@nestjs/common';

import { AppUsersController } from './users.controller';

import { UserModule } from '@/aggregates/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AppUsersController],
})
export class AppUsersModule {}
