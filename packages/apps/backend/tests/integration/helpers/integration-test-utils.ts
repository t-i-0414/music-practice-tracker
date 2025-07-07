import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { cleanupDatabase, disconnectDatabase, getPrismaClient } from '../../helpers';

import { RepositoryModule } from '@/modules/repository/repository.module';
import { RepositoryService } from '@/modules/repository/repository.service';

export class IntegrationTestHelper {
  private app: INestApplication | null = null;
  private module: TestingModule | null = null;

  async setup(
    imports: any[] = [],
    providers: any[] = [],
  ): Promise<{
    app: INestApplication;
    module: TestingModule;
  }> {
    const prismaClient = getPrismaClient();

    this.module = await Test.createTestingModule({
      imports: [RepositoryModule, ...imports],
      providers: [...providers],
    })
      .overrideProvider(RepositoryService)
      .useValue(prismaClient)
      .compile();

    this.app = this.module.createNestApplication();
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
}

export function createIntegrationTestHelper(): IntegrationTestHelper {
  return new IntegrationTestHelper();
}
