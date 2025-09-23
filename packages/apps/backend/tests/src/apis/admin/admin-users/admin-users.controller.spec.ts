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

  describe('post /api/admin-users', () => {
    it('creates an admin user', async () => {
      expect.assertions(2);

      const payload = {
        cognitoSub: `cognito-${randomUUID()}`,
        name: 'Admin Example',
      };

      const response = await httpClient.post('/api/admin-users').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        publicId: expect.any(String),
        cognitoSub: payload.cognitoSub,
        name: payload.name,
        status: 'ACTIVE',
        role: 'VIEWER',
      });
    });
  });

  describe('get /api/admin-users', () => {
    it('finds multiple admin users by public IDs', async () => {
      expect.assertions(3);

      // Create test admin users
      const user1Payload = {
        cognitoSub: `cognito-${randomUUID()}`,
        name: 'Admin One',
      };
      const user2Payload = {
        cognitoSub: `cognito-${randomUUID()}`,
        name: 'Admin Two',
      };

      const user1Response = await httpClient.post('/api/admin-users').send(user1Payload);
      const user2Response = await httpClient.post('/api/admin-users').send(user2Payload);

      const publicId1 = user1Response.body.publicId;
      const publicId2 = user2Response.body.publicId;

      // Query multiple admin users
      const response = await httpClient.get('/api/admin-users').query({ publicIds: [publicId1, publicId2] });

      expect(response.status).toBe(200);
      expect(response.body.adminUsers).toHaveLength(2);
      expect(response.body.adminUsers).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ publicId: publicId1, name: 'Admin One' }),
          expect.objectContaining({ publicId: publicId2, name: 'Admin Two' }),
        ]),
      );
    });

    it('returns empty array when no admin users match', async () => {
      expect.assertions(2);

      const response = await httpClient
        .get('/api/admin-users')
        .query({ publicIds: ['550e8400-e29b-41d4-a716-446655440000'] });

      expect(response.status).toBe(200);
      expect(response.body.adminUsers).toStrictEqual([]);
    });
  });

  describe('get /api/admin-users/:publicId', () => {
    it('fetches an admin user by public ID', async () => {
      expect.assertions(2);

      const payload = {
        cognitoSub: `cognito-${randomUUID()}`,
        name: 'Admin User',
      };

      const createResponse = await httpClient.post('/api/admin-users').send(payload);
      const { publicId } = createResponse.body;

      const response = await httpClient.get(`/api/admin-users/${publicId}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        publicId,
        cognitoSub: payload.cognitoSub,
        name: payload.name,
        status: 'ACTIVE',
      });
    });

    it('returns 404 for non-existent admin user', async () => {
      expect.assertions(2);

      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await httpClient.get(`/api/admin-users/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        errorCode: 'RE0002',
      });
    });
  });

  describe('put /api/admin-users/:publicId', () => {
    it('updates an admin user by public ID', async () => {
      expect.assertions(2);

      const createPayload = {
        cognitoSub: `cognito-${randomUUID()}`,
        name: 'Original Name',
      };

      const createResponse = await httpClient.post('/api/admin-users').send(createPayload);
      const { publicId } = createResponse.body;

      const updateResponse = await httpClient.put(`/api/admin-users/${publicId}`).send({
        name: 'Updated Name',
        role: 'ADMIN',
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toMatchObject({
        publicId,
        cognitoSub: createPayload.cognitoSub,
        name: 'Updated Name',
        role: 'ADMIN',
      });
    });

    it('returns 404 when updating non-existent admin user', async () => {
      expect.assertions(2);

      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await httpClient.put(`/api/admin-users/${nonExistentId}`).send({
        name: 'New Name',
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        errorCode: 'RE0002',
      });
    });
  });

  describe('delete /api/admin-users/:publicId', () => {
    it('deletes an admin user by public ID', async () => {
      expect.assertions(3);

      const payload = {
        cognitoSub: `cognito-${randomUUID()}`,
        name: 'User to Delete',
      };

      const createResponse = await httpClient.post('/api/admin-users').send(payload);
      const { publicId } = createResponse.body;

      const deleteResponse = await httpClient.delete(`/api/admin-users/${publicId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify admin user is deleted
      const fetchResponse = await httpClient.get(`/api/admin-users/${publicId}`);

      expect(fetchResponse.status).toBe(404);

      // Verify admin user is deleted from database
      const userInDatabase = await databaseHelper.client.adminUser.findUnique({ where: { publicId } });

      expect(userInDatabase).toBeNull();
    });
  });

  describe('post /api/admin-users/bulk', () => {
    it('creates multiple admin users at once', async () => {
      expect.assertions(3);

      const response = await httpClient.post('/api/admin-users/bulk').send({
        adminUsers: [
          { cognitoSub: `cognito-${randomUUID()}`, name: 'Bulk Admin One' },
          { cognitoSub: `cognito-${randomUUID()}`, name: 'Bulk Admin Two' },
        ],
      });

      expect(response.status).toBe(201);
      expect(response.body.adminUsers).toHaveLength(2);
      expect(response.body.adminUsers).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Bulk Admin One', status: 'ACTIVE' }),
          expect.objectContaining({ name: 'Bulk Admin Two', status: 'ACTIVE' }),
        ]),
      );
    });
  });

  describe('delete /api/admin-users', () => {
    it('deletes multiple admin users by public IDs', async () => {
      expect.assertions(4);

      const user1Payload = {
        cognitoSub: `cognito-${randomUUID()}`,
        name: 'Admin One to Delete',
      };
      const user2Payload = {
        cognitoSub: `cognito-${randomUUID()}`,
        name: 'Admin Two to Delete',
      };

      const user1Response = await httpClient.post('/api/admin-users').send(user1Payload);
      const user2Response = await httpClient.post('/api/admin-users').send(user2Payload);

      const publicId1 = user1Response.body.publicId;
      const publicId2 = user2Response.body.publicId;

      const deleteResponse = await httpClient.delete('/api/admin-users').send({
        publicIds: [publicId1, publicId2],
      });

      expect(deleteResponse.status).toBe(204);

      // Verify admin users are deleted
      const user1InDatabase = await databaseHelper.client.adminUser.findUnique({ where: { publicId: publicId1 } });
      const user2InDatabase = await databaseHelper.client.adminUser.findUnique({ where: { publicId: publicId2 } });

      expect(user1InDatabase).toBeNull();
      expect(user2InDatabase).toBeNull();

      // Verify they return 404 when fetched
      const fetchResponse = await httpClient.get(`/api/admin-users/${publicId1}`);

      expect(fetchResponse.status).toBe(404);
    });
  });
});
