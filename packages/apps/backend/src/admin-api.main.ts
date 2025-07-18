import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AdminApiModule } from './modules/api/admin/admin.module';
import { isDevelopment } from './utils/environment';

const DEFAULT_PORT_NUMBER = 3001;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AdminApiModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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

  const port = process.env.ADMIN_API_PORT ?? DEFAULT_PORT_NUMBER;
  await app.listen(port);
}
void bootstrap();
