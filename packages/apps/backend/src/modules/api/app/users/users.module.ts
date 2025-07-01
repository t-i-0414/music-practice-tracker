import { Module } from '@nestjs/common';

import { AppUsersController } from './users.controller';

import { UserModule } from '@/modules/aggregate/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AppUsersController],
})
export class AppUsersModule {}
