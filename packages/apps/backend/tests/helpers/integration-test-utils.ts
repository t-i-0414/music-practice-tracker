import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DatabaseTestUtils } from './database-test-utils';

import { RepositoryModule } from '@/modules/repository/repository.module';
import { RepositoryService } from '@/modules/repository/repository.service';

export class IntegrationTestHelper {
  private app: INestApplication | null = null;
  private module: TestingModule | null = null;
  private readonly dbUtils: DatabaseTestUtils;

  constructor() {
    this.dbUtils = new DatabaseTestUtils();
  }

  async setup(
    imports: any[] = [],
    providers: any[] = [],
  ): Promise<{
    app: INestApplication;
    module: TestingModule;
    dbUtils: DatabaseTestUtils;
  }> {
    await this.dbUtils.connect();

    this.module = await Test.createTestingModule({
      imports: [RepositoryModule, ...imports],
      providers: [...providers],
    })
      .overrideProvider(RepositoryService)
      .useValue(this.dbUtils.getPrismaClient())
      .compile();

    this.app = this.module.createNestApplication();
    await this.app.init();

    return {
      app: this.app,
      module: this.module,
      dbUtils: this.dbUtils,
    };
  }

  async teardown(): Promise<void> {
    await this.dbUtils.cleanDatabase();

    if (this.app) {
      await this.app.close();
    }

    await this.dbUtils.disconnect();
  }

  async cleanupBeforeEach(): Promise<void> {
    await this.dbUtils.cleanDatabase();
  }
}

export function createIntegrationTestHelper(): IntegrationTestHelper {
  return new IntegrationTestHelper();
}
