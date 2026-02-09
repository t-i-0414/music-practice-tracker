import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { GlobalExceptionFilter } from '../utils/filters/global-exception.filter';

import { AppApiUsersModule } from './users/users.module';
import { CommonModule } from './utils/common.module';
import { UserAuthGuard } from './utils/guards/user-auth.guard';

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
