import { randomUUID } from 'node:crypto';

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { UserStatus } from '@/generated/prisma';
import { createAdminApiNestApplication } from '@/tests/e2e/helpers/app-server.helper';
import { resetFirebaseAuthEmulator } from '@/tests/e2e/helpers/firebase-emulator.helper';
import { UserFactory } from '@/tests/factory';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('e2e Admin API /api/users', () => {
  let app: INestApplication;
  let databaseHelper: DatabaseHelper;

  const userFactory = new UserFactory();
  const server = () => request(app.getHttpServer());

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
    resetFirebaseAuthEmulator();

    app = await createAdminApiNestApplication(databaseHelper);
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

  describe('get /api/users', () => {
    it('should return users that match provided publicIds', async () => {
      expect.assertions(3);

      const [user1Data, user2Data, user3Data] = [userFactory.build(), userFactory.build(), userFactory.build()];

      const createdUsers = await databaseHelper.client.user.createManyAndReturn({
        data: [
          {
            firebaseUid: user1Data.firebaseUid,
            name: user1Data.name,
            status: user1Data.status,
            publicId: user1Data.publicId,
          },
          {
            firebaseUid: user2Data.firebaseUid,
            name: user2Data.name,
            status: user2Data.status,
            publicId: user2Data.publicId,
          },
          {
            firebaseUid: user3Data.firebaseUid,
            name: user3Data.name,
            status: user3Data.status,
            publicId: user3Data.publicId,
          },
        ],
      });

      const response = await server()
        .get('/api/users')
        .query({ publicIds: [createdUsers[0].publicId, createdUsers[2].publicId] })
        .expect(200);

      expect(response.body.users).toHaveLength(2);

      const returnedIds = response.body.users.map((user: { publicId: string }) => user.publicId).sort();
      const expectedIds = [createdUsers[0].publicId, createdUsers[2].publicId].sort();

      expect(returnedIds).toStrictEqual(expectedIds);
      expect(response.body.users[0]).toHaveProperty('firebaseUid');
    });

    it('should support comma-separated query values', async () => {
      expect.assertions(1);

      const userA = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'User A' }),
      });
      const userB = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'User B' }),
      });

      const response = await server()
        .get('/api/users')
        .query({ publicIds: `${userA.publicId},${userB.publicId}` })
        .expect(200);

      const responseIds = response.body.users.map((user: { publicId: string }) => user.publicId).sort();

      expect(responseIds).toStrictEqual([userA.publicId, userB.publicId].sort());
    });

    it('should reject request when publicIds are missing', async () => {
      expect.assertions(2);

      const response = await server().get('/api/users').expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should reject invalid UUID values', async () => {
      expect.assertions(2);

      const response = await server().get('/api/users').query({ publicIds: 'not-a-uuid' }).expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });
  });

  describe('post /api/users', () => {
    it('should create a user', async () => {
      expect.assertions(3);

      const response = await server()
        .post('/api/users')
        .send({ firebaseUid: `uid-${randomUUID()}`, name: 'Admin Created User' })
        .expect(201);

      expect(response.body.name).toBe('Admin Created User');
      expect(response.body.publicId).toBeDefined();

      const userInDb = await databaseHelper.client.user.findUnique({
        where: { firebaseUid: response.body.firebaseUid },
      });

      expect(userInDb).not.toBeNull();
    });

    it('should return 400 when payload validation fails', async () => {
      expect.assertions(2);

      const response = await server().post('/api/users').send({ firebaseUid: '', name: '' }).expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should return 409 on unique constraint violation', async () => {
      expect.assertions(2);

      const existingUser = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'Existing User' }),
      });

      const response = await server()
        .post('/api/users')
        .send({ firebaseUid: existingUser.firebaseUid, name: 'Existing User' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.errorCode).toBe('RE0003');
    });
  });

  describe('delete /api/users', () => {
    it('should delete multiple users', async () => {
      expect.assertions(4);

      const userA = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'Delete A' }),
      });
      const userB = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'Delete B' }),
      });
      const userC = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'Keep C' }),
      });

      await server()
        .delete('/api/users')
        .send({ publicIds: [userA.publicId, userB.publicId] })
        .expect(204);

      const remaining = await databaseHelper.client.user.findMany();

      expect(remaining).toHaveLength(1);
      expect(remaining[0].publicId).toBe(userC.publicId);

      // Deleting non-existent IDs should still succeed
      await server()
        .delete('/api/users')
        .send({ publicIds: [randomUUID()] })
        .expect(204);
      const after = await databaseHelper.client.user.findMany();

      expect(after).toHaveLength(1);
      expect(after[0].publicId).toBe(userC.publicId);
    });

    it('should validate request body', async () => {
      expect.assertions(2);

      const response = await server().delete('/api/users').send({ publicIds: [] }).expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should return 400 when publicIds contain invalid UUIDs', async () => {
      expect.assertions(2);

      const response = await server()
        .delete('/api/users')
        .send({ publicIds: ['not-a-uuid'] })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });
  });

  describe('post /api/users/bulk', () => {
    it('should create multiple users', async () => {
      expect.assertions(2);

      const response = await server()
        .post('/api/users/bulk')
        .send({
          users: [
            { firebaseUid: `uid-${randomUUID()}`, name: 'Bulk User 1' },
            { firebaseUid: `uid-${randomUUID()}`, name: 'Bulk User 2' },
          ],
        })
        .expect(201);

      expect(response.body.users).toHaveLength(2);

      const count = await databaseHelper.client.user.count();

      expect(count).toBe(2);
    });

    it('should return 400 when bulk payload is invalid', async () => {
      expect.assertions(2);

      const response = await server()
        .post('/api/users/bulk')
        .send({ users: [{ firebaseUid: '', name: '' }] })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should fail entire batch on duplicate entry', async () => {
      expect.assertions(2);

      const duplicateUid = `uid-${randomUUID()}`;
      const response = await server()
        .post('/api/users/bulk')
        .send({
          users: [
            { firebaseUid: duplicateUid, name: 'Bulk One' },
            { firebaseUid: duplicateUid, name: 'Bulk Duplicate' },
          ],
        })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.errorCode).toBe('RE0003');
    });
  });

  describe('crud /api/users/:publicId', () => {
    it('should get a single user', async () => {
      expect.assertions(2);

      const user = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'Fetch Me' }),
      });

      const response = await server().get(`/api/users/${user.publicId}`).expect(200);

      expect(response.body.publicId).toBe(user.publicId);
      expect(response.body.name).toBe('Fetch Me');
    });

    it('should return 404 when user not found', async () => {
      expect.assertions(2);

      const response = await server().get(`/api/users/${randomUUID()}`).expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });

    it('should return 400 for invalid uuid', async () => {
      expect.assertions(2);

      const response = await server().get('/api/users/not-a-uuid').expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should update a user', async () => {
      expect.assertions(3);

      const user = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'Before Update', status: UserStatus.ACTIVE }),
      });

      const response = await server()
        .put(`/api/users/${user.publicId}`)
        .send({ name: 'After Update', status: UserStatus.SUSPENDED })
        .expect(200);

      expect(response.body.name).toBe('After Update');
      expect(response.body.status).toBe(UserStatus.SUSPENDED);

      const userInDb = await databaseHelper.client.user.findUnique({
        where: { publicId: user.publicId },
      });

      expect(userInDb?.status).toBe(UserStatus.SUSPENDED);
    });

    it('should return 404 when updating a non-existent user', async () => {
      expect.assertions(2);

      const response = await server().put(`/api/users/${randomUUID()}`).send({ name: 'Missing User' }).expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });

    it('should return 400 when update payload is invalid', async () => {
      expect.assertions(2);

      const user = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'Validate Me' }),
      });

      const response = await server().put(`/api/users/${user.publicId}`).send({ status: 'INVALID_STATUS' }).expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should return 400 for invalid uuid on update', async () => {
      expect.assertions(2);

      const response = await server().put('/api/users/not-a-uuid').send({ name: 'Invalid' }).expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should delete a user', async () => {
      expect.assertions(1);

      const user = await databaseHelper.client.user.create({
        data: userFactory.build({ name: 'Delete Target' }),
      });

      await server().delete(`/api/users/${user.publicId}`).expect(204);

      const remaining = await databaseHelper.client.user.findUnique({ where: { publicId: user.publicId } });

      expect(remaining).toBeNull();
    });

    it('should return 404 when deleting a non-existent user', async () => {
      expect.assertions(2);

      const response = await server().delete(`/api/users/${randomUUID()}`).expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });

    it('should return 400 for invalid uuid on delete', async () => {
      expect.assertions(2);

      const response = await server().delete('/api/users/not-a-uuid').expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });
  });
});
