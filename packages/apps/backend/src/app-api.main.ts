import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppApiModule } from './modules/api/app/app.module';
import { isDevelopment } from './utils/environment';

const DEFAULT_PORT_NUMBER = 3000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppApiModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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
