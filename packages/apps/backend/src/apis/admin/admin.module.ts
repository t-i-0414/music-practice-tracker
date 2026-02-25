import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { CommonModule } from '../app/utils/common.module';
import { GlobalExceptionFilter } from '../utils/filters/global-exception.filter';
import { HealthModule } from '../utils/health/health.module';
import { TracingInterceptor } from '../utils/interceptors/tracing.interceptor';
import { ObservabilityModule } from '../utils/modules/observability.module';

import { AdminAdminUsersModule } from './admin-users/admin-users.module';
import { AdminUsersModule } from './users/users.module';

import { validateEnvironment } from '@/config/env-validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ObservabilityModule,
    HealthModule,
    CommonModule,
    AdminUsersModule,
    AdminAdminUsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
  ],
})
export class AdminApiModule {}
