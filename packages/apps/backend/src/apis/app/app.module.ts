import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { GlobalExceptionFilter } from '../utils/filters/global-exception.filter';

import { AppApiAuthModule } from './auth/auth.module';
import { AppApiUsersModule } from './users/users.module';
import { CommonModule } from './utils/common.module';
import { UserAuthGuard } from './utils/guards/user-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    AppApiAuthModule,
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
  ],
})
export class AppApiModule {}
