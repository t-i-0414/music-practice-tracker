import { ClassSerializerInterceptor, ValidationPipe, type INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const useGlobalOptions = (app: INestApplication): void => {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
};
