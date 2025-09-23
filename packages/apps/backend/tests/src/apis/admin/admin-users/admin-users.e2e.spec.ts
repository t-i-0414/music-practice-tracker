import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';

import { AdminApiModule } from '@/apis/admin/admin.module';
import { DatabaseHelper } from '@/tests/helpers/database.helper';
import { createTestingApp, type TestingHttpClient } from '@/tests/helpers/testing-app.helper';

describe('e2e AdminApiAdminUsersController', () => {
  let app: INestApplication;
  let httpClient: TestingHttpClient;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    ({ app, httpClient } = await createTestingApp(AdminApiModule));

    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
    await app.close();
  });

  it('creates and fetches an admin user', async () => {
    expect.assertions(2);

    const payload = {
      cognitoSub: `cognito-${randomUUID()}`,
      name: 'Admin Example',
    };

    const createResponse = await httpClient.post('/api/admin-users').send(payload).expect(201);

    expect(createResponse.body).toMatchObject({
      publicId: expect.any(String),
      cognitoSub: payload.cognitoSub,
      name: payload.name,
      status: 'ACTIVE',
      role: 'VIEWER',
    });

    const { publicId } = createResponse.body;
    const fetchResponse = await httpClient.get(`/api/admin-users/${publicId}`).expect(200);

    expect(fetchResponse.body).toMatchObject({
      publicId,
      cognitoSub: payload.cognitoSub,
      name: payload.name,
    });
  });
});
