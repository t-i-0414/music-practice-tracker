import { Module } from '@nestjs/common';

import { AdminAdminUsersController } from './controller';

import { AdminUserModule } from '@/aggregates/admin-user/module';

@Module({
  imports: [AdminUserModule],
  controllers: [AdminAdminUsersController],
})
export class AdminAdminUsersModule {}
