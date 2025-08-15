import { Module } from '@nestjs/common';

import { AdminAdminUsersController } from './admin-users.controller';

import { AdminUserModule } from '@/modules/aggregate/admin-user/admin-user.module';

@Module({
  imports: [AdminUserModule],
  controllers: [AdminAdminUsersController],
})
export class AdminAdminUsersModule {}
