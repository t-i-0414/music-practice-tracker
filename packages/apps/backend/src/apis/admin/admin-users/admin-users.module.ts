import { Module } from '@nestjs/common';

import { AdminApiAdminUsersController } from './admin-users.controller';

import { AdminUserModule } from '@/domain/aggregates/admin-user/admin-user.module';

@Module({
  imports: [AdminUserModule],
  controllers: [AdminApiAdminUsersController],
})
export class AdminAdminUsersModule {}
