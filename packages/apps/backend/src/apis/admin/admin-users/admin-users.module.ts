import { Module } from '@nestjs/common';

import { AdminAdminUsersController } from './admin-users.controller';

import { AdminUserModule } from '@/aggregates/admin-user/admin-user.module';

@Module({
  imports: [AdminUserModule],
  controllers: [AdminAdminUsersController],
})
export class AdminAdminUsersModule {}
