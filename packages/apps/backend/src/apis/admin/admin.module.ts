import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GlobalExceptionFilter } from '../utils/filters/global-exception.filter';

import { AdminAdminUsersModule } from './admin-users/admin-users.module';
import { AdminUsersModule } from './users/users.module';

@Module({
  imports: [AdminUsersModule, AdminAdminUsersModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AdminApiModule {}
