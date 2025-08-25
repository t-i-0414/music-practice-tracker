import { Module } from '@nestjs/common';

import { AdminUsersController } from './users.controller';

import { UserModule } from '@/aggregates/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
