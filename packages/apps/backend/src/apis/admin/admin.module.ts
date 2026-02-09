import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { CommonModule } from '../app/utils/common.module';
import { GlobalExceptionFilter } from '../utils/filters/global-exception.filter';

import { AdminAdminUsersModule } from './admin-users/admin-users.module';
import { AdminUsersModule } from './users/users.module';

import { isDevelopment } from '@/utils/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClsModule.forRoot({
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: () => crypto.randomUUID(),
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: isDevelopment()
          ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
          : undefined,
        level: isDevelopment() ? 'debug' : 'info',
        autoLogging: true,
        redact: ['req.headers.authorization'],
      },
    }),
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
