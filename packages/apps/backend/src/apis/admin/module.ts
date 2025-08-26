import { Module } from '@nestjs/common';

import { AdminAdminUsersModule } from './admin-users/module';
import { AdminUsersModule } from './users/module';

@Module({
  imports: [AdminUsersModule, AdminAdminUsersModule],
})
export class AdminApiModule {}
