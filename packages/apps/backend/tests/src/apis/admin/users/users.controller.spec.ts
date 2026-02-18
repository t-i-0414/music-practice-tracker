import type { INestApplication } from '@nestjs/common';

import { AdminApiModule } from '@/apis/admin/admin.module';
import { DatabaseHelper } from '@/tests/helpers/database.helper';
import { FirebaseAuthEmulatorHelper } from '@/tests/helpers/firebase-auth-emulator.helper';
import { createTestingApp, type TestingHttpClient } from '@/tests/helpers/testing-app.helper';

describe('e2e AdminApiUsersController', () => {
  let app: INestApplication;
  let httpClient: TestingHttpClient;
  let databaseHelper: DatabaseHelper;
  let firebaseHelper: FirebaseAuthEmulatorHelper;

  beforeAll(async () => {
    firebaseHelper = new FirebaseAuthEmulatorHelper();
    await firebaseHelper.ensureHealthy();

    ({ app, httpClient } = await createTestingApp(AdminApiModule));

    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await firebaseHelper.resetAllUsers();
    await databaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await firebaseHelper.resetAllUsers();
    await databaseHelper.disconnect();
    await app.close();
  });

  describe('post /api/users', () => {
    it('creates a new user', async () => {
      expect.assertions(2);

      const { uid } = await firebaseHelper.createVerifiedUser();

      const response = await httpClient.post('/api/users').send({
        firebaseUid: uid,
        name: 'Test User',
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        publicId: expect.any(String),
        firebaseUid: uid,
        name: 'Test User',
        status: 'ACTIVE',
      });
    });
  });

  describe('get /api/users', () => {
    it('finds multiple users by public IDs', async () => {
      expect.assertions(3);

      // Create test users
      const { uid: uid1 } = await firebaseHelper.createVerifiedUser();
      const { uid: uid2 } = await firebaseHelper.createVerifiedUser();

      const user1Response = await httpClient.post('/api/users').send({
        firebaseUid: uid1,
        name: 'User One',
      });

      const user2Response = await httpClient.post('/api/users').send({
        firebaseUid: uid2,
        name: 'User Two',
      });

      const publicId1 = user1Response.body.publicId;
      const publicId2 = user2Response.body.publicId;

      // Query multiple users
      const response = await httpClient.get('/api/users').query({ publicIds: [publicId1, publicId2] });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(2);
      expect(response.body.users).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ publicId: publicId1, name: 'User One' }),
          expect.objectContaining({ publicId: publicId2, name: 'User Two' }),
        ]),
      );
    });

    it('returns empty array when no users match', async () => {
      expect.assertions(2);

      const response = await httpClient
        .get('/api/users')
        .query({ publicIds: ['550e8400-e29b-41d4-a716-446655440000'] });

      expect(response.status).toBe(200);
      expect(response.body.users).toStrictEqual([]);
    });
  });

  describe('delete /api/users', () => {
    it('deletes multiple users by public IDs', async () => {
      expect.assertions(6);

      const { uid: uid1 } = await firebaseHelper.createVerifiedUser();
      const { uid: uid2 } = await firebaseHelper.createVerifiedUser();

      const user1Response = await httpClient.post('/api/users').send({
        firebaseUid: uid1,
        name: 'User One to Delete',
      });

      const user2Response = await httpClient.post('/api/users').send({
        firebaseUid: uid2,
        name: 'User Two to Delete',
      });

      const publicId1 = user1Response.body.publicId;
      const publicId2 = user2Response.body.publicId;

      const deleteResponse = await httpClient.delete('/api/users').send({
        publicIds: [publicId1, publicId2],
      });

      expect(deleteResponse.status).toBe(204);

      // Verify users are deleted from database
      const user1InDatabase = await databaseHelper.client.user.findUnique({ where: { publicId: publicId1 } });
      const user2InDatabase = await databaseHelper.client.user.findUnique({ where: { publicId: publicId2 } });

      expect(user1InDatabase).toBeNull();
      expect(user2InDatabase).toBeNull();

      // Verify they return 404 when fetched
      const fetchResponse = await httpClient.get(`/api/users/${publicId1}`);

      expect(fetchResponse.status).toBe(404);

      // Verify Firebase accounts are deleted
      const firebaseUser1 = await firebaseHelper.getUserByUid(uid1);
      const firebaseUser2 = await firebaseHelper.getUserByUid(uid2);

      expect(firebaseUser1).toBeUndefined();
      expect(firebaseUser2).toBeUndefined();
    });
  });

  describe('post /api/users/bulk', () => {
    it('creates multiple users at once', async () => {
      expect.assertions(3);

      const { uid: uid1 } = await firebaseHelper.createVerifiedUser();
      const { uid: uid2 } = await firebaseHelper.createVerifiedUser();

      const response = await httpClient.post('/api/users/bulk').send({
        users: [
          { firebaseUid: uid1, name: 'Bulk User One' },
          { firebaseUid: uid2, name: 'Bulk User Two' },
        ],
      });

      expect(response.status).toBe(201);
      expect(response.body.users).toHaveLength(2);
      expect(response.body.users).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ firebaseUid: uid1, name: 'Bulk User One' }),
          expect.objectContaining({ firebaseUid: uid2, name: 'Bulk User Two' }),
        ]),
      );
    });
  });

  describe('get /api/users/:publicId', () => {
    it('fetches a user by public ID', async () => {
      expect.assertions(2);

      const { uid } = await firebaseHelper.createVerifiedUser();

      const createResponse = await httpClient.post('/api/users').send({
        firebaseUid: uid,
        name: 'Test User',
      });

      const { publicId } = createResponse.body;

      const response = await httpClient.get(`/api/users/${publicId}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        publicId,
        firebaseUid: uid,
        name: 'Test User',
        status: 'ACTIVE',
      });
    });

    it('returns 404 for non-existent user', async () => {
      expect.assertions(2);

      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await httpClient.get(`/api/users/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        errorCode: 'RE0002',
      });
    });
  });

  describe('put /api/users/:publicId', () => {
    it('updates a user by public ID', async () => {
      expect.assertions(2);

      const { uid } = await firebaseHelper.createVerifiedUser();

      const createResponse = await httpClient.post('/api/users').send({
        firebaseUid: uid,
        name: 'Original Name',
      });

      const { publicId } = createResponse.body;

      const updateResponse = await httpClient.put(`/api/users/${publicId}`).send({
        name: 'Updated Name',
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toMatchObject({
        publicId,
        firebaseUid: uid,
        name: 'Updated Name',
      });
    });

    it('returns 404 when updating non-existent user', async () => {
      expect.assertions(2);

      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await httpClient.put(`/api/users/${nonExistentId}`).send({
        name: 'New Name',
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        errorCode: 'RE0002',
      });
    });
  });

  describe('delete /api/users/:publicId', () => {
    it('deletes a user by public ID', async () => {
      expect.assertions(4);

      const { uid } = await firebaseHelper.createVerifiedUser();

      const createResponse = await httpClient.post('/api/users').send({
        firebaseUid: uid,
        name: 'User to Delete',
      });

      const { publicId } = createResponse.body;

      const deleteResponse = await httpClient.delete(`/api/users/${publicId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify user is deleted
      const fetchResponse = await httpClient.get(`/api/users/${publicId}`);

      expect(fetchResponse.status).toBe(404);

      // Verify user is deleted from database
      const userInDatabase = await databaseHelper.client.user.findUnique({ where: { publicId } });

      expect(userInDatabase).toBeNull();

      // Verify Firebase account is deleted
      const firebaseUser = await firebaseHelper.getUserByUid(uid);

      expect(firebaseUser).toBeUndefined();
    });
  });
});
