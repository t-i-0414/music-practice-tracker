import { DatabaseHelper } from '@/tests/helpers/database.helper';

export class IntegrationTestSetup {
  protected databaseHelper: DatabaseHelper;

  public async setupDatabase(): Promise<DatabaseHelper> {
    this.databaseHelper = new DatabaseHelper();
    await this.databaseHelper.connect();
    return this.databaseHelper;
  }

  public async cleanDatabase(): Promise<void> {
    await this.databaseHelper.cleanDatabase();
  }

  public async teardownDatabase(): Promise<void> {
    await this.databaseHelper.disconnect();
  }

  public getDatabaseHelper(): DatabaseHelper {
    return this.databaseHelper;
  }
}

export function createIntegrationTestSetup(): {
  setup(): Promise<DatabaseHelper>;
  clean(): Promise<void>;
  teardown(): Promise<void>;
} {
  const testSetup = new IntegrationTestSetup();

  return {
    setup: () => testSetup.setupDatabase(),
    clean: () => testSetup.cleanDatabase(),
    teardown: () => testSetup.teardownDatabase(),
  };
}
