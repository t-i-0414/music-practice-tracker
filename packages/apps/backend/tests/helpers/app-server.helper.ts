import { ClassSerializerInterceptor, DynamicModule, INestApplication, Type, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { AdminApiModule } from '@/apis/admin/admin.module';
import { AppApiModule } from '@/apis/app/app.module';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

type NestModule = Type<unknown> | DynamicModule;

async function bootstrapApp(module: NestModule, databaseHelper: DatabaseHelper): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    imports: [module],
  })
    .overrideProvider(RepositoryService)
    .useValue(databaseHelper.client);

  const moduleRef = await builder.compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.init();
  return app;
}

export async function createAppApiNestApplication(databaseHelper: DatabaseHelper): Promise<INestApplication> {
  return bootstrapApp(AppApiModule, databaseHelper);
}

export async function createAdminApiNestApplication(databaseHelper: DatabaseHelper): Promise<INestApplication> {
  return bootstrapApp(AdminApiModule, databaseHelper);
}
