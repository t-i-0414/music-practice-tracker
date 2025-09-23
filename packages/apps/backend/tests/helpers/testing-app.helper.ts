import { type INestApplication, type Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { SuperTest, Test as SuperTestRequest } from 'supertest';

import { useGlobalOptions } from '@/apis/utils/use-global-options';

export type TestingHttpClient = SuperTest<SuperTestRequest>;
const supertest: (app: unknown) => TestingHttpClient = require('supertest');

export async function createTestingApp<T>(
  rootModule: Type<T>,
): Promise<{ app: INestApplication; httpClient: TestingHttpClient }> {
  const app = (await Test.createTestingModule({ imports: [rootModule] }).compile()).createNestApplication();

  useGlobalOptions(app);
  await app.init();

  return { app, httpClient: supertest(app.getHttpServer()) };
}
