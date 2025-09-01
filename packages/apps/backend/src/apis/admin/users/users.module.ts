import { Module } from '@nestjs/common';

import { AdminApiUsersController } from './users.controller';

import { UserModule } from '@/domain/aggregates/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AdminApiUsersController],
})
export class AdminUsersModule {}
