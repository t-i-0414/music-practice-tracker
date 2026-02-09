import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { useGlobalOptions } from '../utils/use-global-options';

import { AppApiModule } from '@/apis/app/app.module';
import { isDevelopment } from '@/utils/environment';

const DEFAULT_PORT_NUMBER = 3000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppApiModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  useGlobalOptions(app);

  // Setup Swagger in non-production environments
  if (isDevelopment()) {
    const config = new DocumentBuilder()
      .setTitle('Music Practice Tracker App API')
      .setDescription('The Music Practice Tracker App API documentation')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.APP_API_PORT ?? DEFAULT_PORT_NUMBER;
  await app.listen(port);
}
void bootstrap();
