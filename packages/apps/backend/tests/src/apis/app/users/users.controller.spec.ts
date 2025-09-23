import type { INestApplication } from '@nestjs/common';

import { AppApiModule } from '@/apis/app/app.module';
import { createUserViaApi } from '@/tests/helpers/create-user-via-api';
import { DatabaseHelper } from '@/tests/helpers/database.helper';
import { FirebaseAuthEmulatorHelper } from '@/tests/helpers/firebase-auth-emulator.helper';
import { createTestingApp, type TestingHttpClient } from '@/tests/helpers/testing-app.helper';

describe('e2e AppApiUsersController', () => {
  let app: INestApplication;
  let httpClient: TestingHttpClient;
  let databaseHelper: DatabaseHelper;
  let firebaseHelper: FirebaseAuthEmulatorHelper;

  beforeAll(async () => {
    firebaseHelper = new FirebaseAuthEmulatorHelper();
    await firebaseHelper.ensureHealthy();

    ({ app, httpClient } = await createTestingApp(AppApiModule));

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
    it('creates a user when a verified token is provided', async () => {
      expect.assertions(2);

      const { idToken, uid } = await firebaseHelper.createVerifiedUser();

      const response = await httpClient
        .post('/api/users')
        .set('Authorization', `Bearer ${idToken}`)
        .send({ firebaseUid: uid, name: 'Alice Example' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        publicId: expect.any(String),
        firebaseUid: uid,
        name: 'Alice Example',
        status: 'ACTIVE',
      });
    });

    it('returns 401 error when creating user without authentication token', async () => {
      expect.assertions(2);

      const response = await httpClient.post('/api/users').send({ firebaseUid: 'test-uid', name: 'Test User' });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        errorCode: 'AP0401',
      });
    });

    it('returns 403 error when email is not verified and provider is not allowed', async () => {
      expect.assertions(2);

      // Create user with unverified email using password provider
      const signUpResponse = await fetch(
        `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-api-key`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `unverified-${Date.now()}@example.com`,
            password: 'Password123!',
            returnSecureToken: true,
          }),
        },
      );
      const { idToken } = (await signUpResponse.json()) as { idToken: string };

      const response = await httpClient
        .post('/api/users')
        .set('Authorization', `Bearer ${idToken}`)
        .send({ firebaseUid: 'test-uid', name: 'Test User' });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        errorCode: 'AP0403',
      });
    });

    it('returns existing user when trying to create duplicate', async () => {
      expect.assertions(3);

      const { idToken, uid } = await firebaseHelper.createVerifiedUser();

      // First create the user
      const firstResponse = await httpClient
        .post('/api/users')
        .set('Authorization', `Bearer ${idToken}`)
        .send({ firebaseUid: uid, name: 'First Name' });

      const { publicId } = firstResponse.body;

      // Try to create again with different name
      const secondResponse = await httpClient
        .post('/api/users')
        .set('Authorization', `Bearer ${idToken}`)
        .send({ firebaseUid: uid, name: 'Different Name' });

      expect(secondResponse.status).toBe(201);
      expect(secondResponse.body.publicId).toBe(publicId);
      expect(secondResponse.body.name).toBe('First Name'); // Should return existing user's name
    });
  });

  describe('get /api/users/me', () => {
    it('returns the current user profile', async () => {
      expect.assertions(2);

      const { idToken, uid } = await firebaseHelper.createVerifiedUser();
      const publicId = await createUserViaApi({
        httpClient,
        token: idToken,
        firebaseUid: uid,
        name: 'Alice Example',
      });

      const response = await httpClient.get('/api/users/me').set('Authorization', `Bearer ${idToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        publicId,
        firebaseUid: uid,
        name: 'Alice Example',
        status: 'ACTIVE',
      });
    });
  });

  describe('put /api/users/me', () => {
    it('updates the current user profile', async () => {
      expect.assertions(2);

      const { idToken, uid } = await firebaseHelper.createVerifiedUser();
      const publicId = await createUserViaApi({
        httpClient,
        token: idToken,
        firebaseUid: uid,
        name: 'Alice Example',
      });

      const response = await httpClient
        .put('/api/users/me')
        .set('Authorization', `Bearer ${idToken}`)
        .send({ name: 'Updated Alice' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        publicId,
        firebaseUid: uid,
        name: 'Updated Alice',
      });
    });
  });

  describe('delete /api/users/me', () => {
    it('deletes the current user and removes the record from the database and firebase', async () => {
      expect.assertions(3);

      const { idToken, uid } = await firebaseHelper.createVerifiedUser();
      const publicId = await createUserViaApi({
        httpClient,
        token: idToken,
        firebaseUid: uid,
        name: 'Alice Example',
      });

      const response = await httpClient.delete('/api/users/me').set('Authorization', `Bearer ${idToken}`);
      const userInDatabase = await databaseHelper.client.user.findUnique({ where: { publicId } });
      const userInFirebase = await firebaseHelper.getUserByIdToken(idToken);

      expect(response.status).toBe(204);
      expect(userInDatabase).toBeNull();
      expect(userInFirebase).toBeNull();
    });
  });

  describe('get /api/users/:publicId', () => {
    it('fetches user by public ID', async () => {
      expect.assertions(2);

      const { idToken, uid } = await firebaseHelper.createVerifiedUser();
      const publicId = await createUserViaApi({
        httpClient,
        token: idToken,
        firebaseUid: uid,
        name: 'Test User',
      });

      const response = await httpClient.get(`/api/users/${publicId}`).set('Authorization', `Bearer ${idToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        publicId,
        firebaseUid: uid,
        name: 'Test User',
        status: 'ACTIVE',
      });
    });

    it('returns 404 when fetching non-existent user by ID', async () => {
      expect.assertions(2);

      const { idToken } = await firebaseHelper.createVerifiedUser();
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await httpClient.get(`/api/users/${nonExistentId}`).set('Authorization', `Bearer ${idToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        errorCode: 'RE0002',
      });
    });
  });
});
