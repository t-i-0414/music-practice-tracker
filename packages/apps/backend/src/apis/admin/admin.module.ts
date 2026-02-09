import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { CommonModule } from '../app/utils/common.module';
import { GlobalExceptionFilter } from '../utils/filters/global-exception.filter';
import { ObservabilityModule } from '../utils/modules/observability.module';

import { AdminAdminUsersModule } from './admin-users/admin-users.module';
import { AdminUsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ObservabilityModule,
    CommonModule,
    AdminUsersModule,
    AdminAdminUsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AdminApiModule {}
