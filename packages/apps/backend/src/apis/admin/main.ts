// eslint-disable-next-line import/order -- dd-trace must be initialized before any other imports
import '../../tracer';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { useGlobalOptions } from '../utils/use-global-options';

import { AdminApiModule } from '@/apis/admin/admin.module';
import type { EnvironmentVariables } from '@/config/env-validation';
import { isDevelopment } from '@/utils/environment';

const DEFAULT_PORT_NUMBER = 3001;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AdminApiModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  useGlobalOptions(app);

  // Setup Swagger in non-production environments
  if (isDevelopment()) {
    const config = new DocumentBuilder()
      .setTitle('Music Practice Tracker Admin API')
      .setDescription('The Music Practice Tracker Admin API documentation')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const configService = app.get<ConfigService<EnvironmentVariables>>(ConfigService);
  const port = configService.get<number>('ADMIN_API_PORT') ?? DEFAULT_PORT_NUMBER;
  await app.listen(port);
}
void bootstrap();
