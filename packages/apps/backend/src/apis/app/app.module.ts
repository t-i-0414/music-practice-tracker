import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { GlobalExceptionFilter } from '../utils/filters/global-exception.filter';

import { AppApiAuthModule } from './auth/auth.module';
import { AppApiUsersModule } from './users/users.module';
import { CommonModule } from './utils/common.module';

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
  ],
})
export class AppApiModule {}
