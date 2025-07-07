import { ClassSerializerInterceptor, ValidationPipe, type INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { cleanupDatabase, disconnectDatabase } from '../../helpers';

export class E2ETestHelper {
  private app: INestApplication | null = null;
  private module: TestingModule | null = null;

  async setup(imports: any[] = []): Promise<{
    app: INestApplication;
    module: TestingModule;
  }> {
    this.module = await Test.createTestingModule({
      imports: [...imports],
    }).compile();

    this.app = this.module.createNestApplication();

    this.app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    this.app.useGlobalInterceptors(new ClassSerializerInterceptor(this.app.get(Reflector)));

    await this.app.init();

    return {
      app: this.app,
      module: this.module,
    };
  }

  async teardown(): Promise<void> {
    await cleanupDatabase();

    if (this.app) {
      await this.app.close();
    }

    await disconnectDatabase();
  }

  async cleanupBeforeEach(): Promise<void> {
    await cleanupDatabase();
  }

  getApp(): INestApplication {
    if (!this.app) {
      throw new Error('App is not initialized. Call setup() first.');
    }
    return this.app;
  }
}

export function createE2ETestHelper(): E2ETestHelper {
  return new E2ETestHelper();
}
