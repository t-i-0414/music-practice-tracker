import { randomUUID } from 'node:crypto';

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import { UserStatus } from '@/generated/prisma';
import { UserFactory } from '@/tests/_factory';
import { createAppApiNestApplication } from '@/tests/_helpers/app-server.helper';
import { DatabaseHelper } from '@/tests/_helpers/database.helper';
import { createFirebaseEmailUser, resetFirebaseAuthEmulator } from '@/tests/_helpers/firebase-emulator.helper';
import { buildAuthHeader, createVerifiedFirebaseUser } from '@/tests/_helpers/tokens.helper';

describe('e2e App API /api/users', () => {
  let app: INestApplication;
  let databaseHelper: DatabaseHelper;
  let firebaseAuthService: FirebaseAuthService;

  const userFactory = new UserFactory();
  const server = () => request(app.getHttpServer());

  const buildCreateUserPayload = (firebaseUid: string, name: string) => ({ firebaseUid, name });

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
    resetFirebaseAuthEmulator();

    app = await createAppApiNestApplication(databaseHelper);
    firebaseAuthService = app.get(FirebaseAuthService);
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();
    resetFirebaseAuthEmulator();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await databaseHelper.disconnect();
  });

  describe('post /api/users', () => {
    it('should create a user when firebase email is verified', async () => {
      expect.assertions(5);

      const firebaseUser = createVerifiedFirebaseUser();

      const response = await server()
        .post('/api/users')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .send(buildCreateUserPayload(firebaseUser.localId, 'App User'))
        .expect(201);

      expect(response.body).toHaveProperty('publicId');
      expect(response.body.firebaseUid).toBe(firebaseUser.localId);
      expect(response.body.name).toBe('App User');
      expect(response.body.status).toBe(UserStatus.ACTIVE);

      const userInDb = await databaseHelper.client.user.findUnique({
        where: { firebaseUid: firebaseUser.localId },
      });

      expect(userInDb).not.toBeNull();
    });

    it('should be idempotent for the same firebase UID', async () => {
      expect.assertions(2);

      const firebaseUser = createVerifiedFirebaseUser();

      const payload = buildCreateUserPayload(firebaseUser.localId, 'Duplicated User');
      const first = await server()
        .post('/api/users')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .send(payload)
        .expect(201);

      const second = await server()
        .post('/api/users')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .send(payload)
        .expect(201);

      expect(second.body.publicId).toBe(first.body.publicId);
      expect(second.body.firebaseUid).toBe(firebaseUser.localId);
    });

    it('should return 401 when token is missing', async () => {
      expect.assertions(2);

      const response = await server()
        .post('/api/users')
        .send(buildCreateUserPayload(`uid-${randomUUID()}`, 'No Token'))
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.errorCode).toBe('AP0401');
    });

    it('should return 403 when email is not verified and provider is not allowlisted', async () => {
      expect.assertions(2);

      const firebaseUser = createFirebaseEmailUser({ emailVerified: false });

      const response = await server()
        .post('/api/users')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .send(buildCreateUserPayload(firebaseUser.localId, 'Unverified User'))
        .expect(403);

      expect(response.body.statusCode).toBe(403);
      expect(response.body.errorCode).toBe('AP0403');
    });

    it('should allow creation when provider is in allowlist even if email is not verified', async () => {
      expect.assertions(2);

      const firebaseUser = createFirebaseEmailUser({ emailVerified: false });

      jest.spyOn(firebaseAuthService, 'verifyIdToken').mockResolvedValueOnce({
        uid: firebaseUser.localId,
        email_verified: false,
        firebase: {
          sign_in_provider: 'google.com',
        },
      } as unknown as Awaited<ReturnType<FirebaseAuthService['verifyIdToken']>>);

      await server()
        .post('/api/users')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .send(buildCreateUserPayload(firebaseUser.localId, 'Allowlisted Provider User'))
        .expect(201);

      const userInDb = await databaseHelper.client.user.findUnique({
        where: { firebaseUid: firebaseUser.localId },
      });

      expect(userInDb).not.toBeNull();
      expect(userInDb?.name).toBe('Allowlisted Provider User');
    });

    it('should return 400 when body validation fails', async () => {
      expect.assertions(2);

      const firebaseUser = createVerifiedFirebaseUser();

      const response = await server()
        .post('/api/users')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .send(buildCreateUserPayload(firebaseUser.localId, ''))
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });
  });

  describe('get /api/users/me', () => {
    it('should return the current user', async () => {
      expect.assertions(3);

      const firebaseUser = createVerifiedFirebaseUser();
      const user = userFactory.build({
        firebaseUid: firebaseUser.localId,
        name: 'Current User',
      });
      await databaseHelper.client.user.create({
        data: {
          firebaseUid: user.firebaseUid,
          name: user.name,
          status: user.status,
        },
      });

      const response = await server()
        .get('/api/users/me')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .expect(200);

      expect(response.body.firebaseUid).toBe(firebaseUser.localId);
      expect(response.body.name).toBe('Current User');
      expect(response.body.publicId).toBeDefined();
    });

    it('should return 401 when token is missing', async () => {
      expect.assertions(2);

      const response = await server().get('/api/users/me').expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.errorCode).toBe('AP0401');
    });

    it('should return 404 when user does not exist in DB', async () => {
      expect.assertions(2);

      const firebaseUser = createVerifiedFirebaseUser();

      const response = await server()
        .get('/api/users/me')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });
  });

  describe('put /api/users/me', () => {
    it('should update user name and status', async () => {
      expect.assertions(3);

      const firebaseUser = createVerifiedFirebaseUser();
      const user = await databaseHelper.client.user.create({
        data: {
          firebaseUid: firebaseUser.localId,
          name: 'Before Update',
          status: UserStatus.ACTIVE,
        },
      });

      const response = await server()
        .put('/api/users/me')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .send({ name: 'After Update', status: UserStatus.SUSPENDED })
        .expect(200);

      expect(response.body.publicId).toBe(user.publicId);
      expect(response.body.name).toBe('After Update');
      expect(response.body.status).toBe(UserStatus.SUSPENDED);
    });

    it('should reject payload with additional properties', async () => {
      expect.assertions(2);

      const firebaseUser = createVerifiedFirebaseUser();
      await databaseHelper.client.user.create({
        data: {
          firebaseUid: firebaseUser.localId,
          name: 'User',
          status: UserStatus.ACTIVE,
        },
      });

      const response = await server()
        .put('/api/users/me')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .send({ name: 'User', unauthorized: true })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });
  });

  describe('delete /api/users/me', () => {
    it('should delete user and call Firebase delete', async () => {
      expect.assertions(3);

      const firebaseUser = createVerifiedFirebaseUser();
      await databaseHelper.client.user.create({
        data: {
          firebaseUid: firebaseUser.localId,
          name: 'To Delete',
          status: UserStatus.ACTIVE,
        },
      });

      const deleteSpy = jest.spyOn(firebaseAuthService, 'deleteUser');

      await server().delete('/api/users/me').set('Authorization', buildAuthHeader(firebaseUser.idToken)).expect(204);

      expect(deleteSpy).toHaveBeenCalledTimes(1);

      const userInDb = await databaseHelper.client.user.findUnique({
        where: { firebaseUid: firebaseUser.localId },
      });

      expect(userInDb).toBeNull();

      expect(deleteSpy).toHaveBeenCalledWith(firebaseUser.localId);
    });

    it('should still return 204 when Firebase reports user-not-found', async () => {
      expect.assertions(3);

      const firebaseUser = createVerifiedFirebaseUser();
      await databaseHelper.client.user.create({
        data: {
          firebaseUid: firebaseUser.localId,
          name: 'Already Deleted',
          status: UserStatus.ACTIVE,
        },
      });

      const deleteSpy = jest.spyOn(firebaseAuthService, 'deleteUser').mockResolvedValueOnce(undefined);

      const response = await server()
        .delete('/api/users/me')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .expect(204);

      const userInDb = await databaseHelper.client.user.findUnique({
        where: { firebaseUid: firebaseUser.localId },
      });

      expect(response.status).toBe(204);
      expect(userInDb).toBeNull();
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('get /api/users/:publicId', () => {
    it('should fetch another user by publicId', async () => {
      expect.assertions(2);

      const currentFirebaseUser = createVerifiedFirebaseUser();
      await databaseHelper.client.user.create({
        data: {
          firebaseUid: currentFirebaseUser.localId,
          name: 'Current User',
          status: UserStatus.ACTIVE,
        },
      });

      const otherUser = await databaseHelper.client.user.create({
        data: {
          firebaseUid: `other-${randomUUID()}`,
          name: 'Other User',
          status: UserStatus.ACTIVE,
        },
      });

      const response = await server()
        .get(`/api/users/${otherUser.publicId}`)
        .set('Authorization', buildAuthHeader(currentFirebaseUser.idToken))
        .expect(200);

      expect(response.body.publicId).toBe(otherUser.publicId);
      expect(response.body.name).toBe('Other User');
    });

    it('should return 400 for invalid uuid path parameter', async () => {
      expect.assertions(2);

      const firebaseUser = createVerifiedFirebaseUser();
      await databaseHelper.client.user.create({
        data: {
          firebaseUid: firebaseUser.localId,
          name: 'Current User',
          status: UserStatus.ACTIVE,
        },
      });

      const response = await server()
        .get('/api/users/not-a-uuid')
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should return 404 when user does not exist', async () => {
      expect.assertions(2);

      const firebaseUser = createVerifiedFirebaseUser();
      await databaseHelper.client.user.create({
        data: {
          firebaseUid: firebaseUser.localId,
          name: 'Current User',
          status: UserStatus.ACTIVE,
        },
      });

      const response = await server()
        .get(`/api/users/${randomUUID()}`)
        .set('Authorization', buildAuthHeader(firebaseUser.idToken))
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });
  });
});
