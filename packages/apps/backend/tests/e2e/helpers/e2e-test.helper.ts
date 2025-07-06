import { ClassSerializerInterceptor, type INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { AdminApiModule } from '@/modules/api/admin.module';
import { AppApiModule } from '@/modules/api/app.module';

export async function createTestApp(): Promise<{
  app: INestApplication;
  module: TestingModule;
}> {
  const module = await Test.createTestingModule({
    imports: [AppApiModule, AdminApiModule],
  }).compile();

  const app = module.createNestApplication();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.init();

  return { app, module };
}
