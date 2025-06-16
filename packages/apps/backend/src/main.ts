import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { isDevelopment } from './common/utils/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Setup Swagger in non-production environments
  if (isDevelopment()) {
    const config = new DocumentBuilder()
      .setTitle('Music Practice Tracker API')
      .setDescription('The Music Practice Tracker API documentation')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  if (isDevelopment()) {
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger UI is available at: http://localhost:${port}/api`);
  }
}
void bootstrap();
