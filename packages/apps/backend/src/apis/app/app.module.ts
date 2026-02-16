import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { GlobalExceptionFilter } from '../utils/filters/global-exception.filter';
import { HealthModule } from '../utils/health/health.module';
import { TracingInterceptor } from '../utils/interceptors/tracing.interceptor';
import { ObservabilityModule } from '../utils/modules/observability.module';

import { AppApiUsersModule } from './users/users.module';
import { CommonModule } from './utils/common.module';
import { UserAuthGuard } from './utils/guards/user-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ObservabilityModule,
    HealthModule,
    CommonModule,
    AppApiUsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: UserAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
  ],
})
export class AppApiModule {}
