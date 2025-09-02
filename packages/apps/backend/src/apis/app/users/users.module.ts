import { Module } from '@nestjs/common';

import { AppApiUsersController } from './users.controller';

import { UserModule } from '@/domain/aggregates/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AppApiUsersController],
})
export class AppApiUsersModule {}
