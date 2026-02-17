import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { isDevelopment } from '@/utils/environment';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ClsModule.forRoot({
      global: true,
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
  ],
})
export class ObservabilityModule {}
