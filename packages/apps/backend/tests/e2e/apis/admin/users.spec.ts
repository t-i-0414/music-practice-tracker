import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AdminApiModule } from '@/apis/admin/admin.module';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('e2e AdminApiUsersController', () => {
  let app: INestApplication;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('admin');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    await app.init();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
    await databaseHelper.disconnect();
  });

  describe('get /admin/api/users', () => {
    it('should get users when no publicIds provided', async () => {
      expect.assertions(1);

      // When no publicIds are provided, the endpoint returns an empty array
      const response = await request(app.getHttpServer()).get('/admin/api/users').expect(200);

      expect(response.body.users).toHaveLength(0);
    });

    it('should get users by public IDs', async () => {
      expect.assertions(2);

      const createResponse1 = await request(app.getHttpServer())
        .post('/admin/api/users')
        .send({ firebaseUid: 'uid-user1', name: 'User 1' })
        .expect(201);

      const createResponse2 = await request(app.getHttpServer())
        .post('/admin/api/users')
        .send({ firebaseUid: 'uid-user2', name: 'User 2' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/admin/api/users')
        .send({ firebaseUid: 'uid-user3', name: 'User 3' })
        .expect(201);

      const publicIds = [createResponse1.body.publicId, createResponse2.body.publicId];
      const response = await request(app.getHttpServer()).get('/admin/api/users').query({ publicIds }).expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.users.map((u: any) => u.publicId)).toStrictEqual(expect.arrayContaining(publicIds));
    });
  });

  describe('post /admin/api/users/bulk', () => {
    it('should create multiple users', async () => {
      expect.assertions(4);

      const createDto = {
        users: [
          { firebaseUid: 'uid-bulk-1', name: 'Bulk 1' },
          { firebaseUid: 'uid-bulk-2', name: 'Bulk 2' },
          { firebaseUid: 'uid-bulk-3', name: 'Bulk 3' },
        ],
      };

      const response = await request(app.getHttpServer()).post('/admin/api/users/bulk').send(createDto).expect(201);

      expect(response.body.users).toHaveLength(3);
      expect(response.body.users[0].firebaseUid).toBe('uid-bulk-1');
      expect(response.body.users[1].firebaseUid).toBe('uid-bulk-2');
      expect(response.body.users[2].firebaseUid).toBe('uid-bulk-3');
    });
  });

  describe('delete /admin/api/users', () => {
    it('should delete multiple users', async () => {
      expect.assertions(2);

      const users: any[] = [];
      const createPromises = Array.from({ length: 3 }, (_, i) =>
        request(app.getHttpServer())
          .post('/admin/api/users')
          .send({ firebaseUid: `uid-del-${i + 1}`, name: `Delete ${i + 1}` })
          .expect(201),
      );

      const responses = await Promise.all(createPromises);
      users.push(...responses.map((response) => response.body));

      const publicIdsToDelete = [users[0].publicId, users[1].publicId];

      await request(app.getHttpServer()).delete('/admin/api/users').send({ publicIds: publicIdsToDelete }).expect(204);

      // Query for the remaining user specifically
      const remainingUsers = await request(app.getHttpServer())
        .get(`/admin/api/users?publicIds=${users[2].publicId}`)
        .expect(200);

      expect(remainingUsers.body.users).toHaveLength(1);
      expect(remainingUsers.body.users[0].publicId).toBe(users[2].publicId);
    });
  });

  describe('apiStandardResponses error format validation', () => {
    describe('post /admin/api/users', () => {
      it('should return error with statusCode and errorCode for validation errors', async () => {
        expect.assertions(3);

        const invalidDto = {
          email: 'invalid-email',
          name: '',
        };

        const response = await request(app.getHttpServer()).post('/admin/api/users').send(invalidDto).expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for duplicate email', async () => {
        expect.assertions(3);

        const createDto = {
          email: 'duplicate@example.com',
          name: 'Duplicate User',
        };

        await request(app.getHttpServer()).post('/admin/api/users').send(createDto).expect(201);

        const response = await request(app.getHttpServer()).post('/admin/api/users').send(createDto).expect(409);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(409);
      });
    });

    describe('get /admin/api/users', () => {
      it('should return error with statusCode and errorCode for invalid query params', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer()).get('/admin/api/users?publicIds=invalid-uuid').expect(500);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(500);
      });
    });

    describe('get /admin/api/users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer()).get('/admin/api/users/invalid-uuid').expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .get('/admin/api/users/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });
    });

    describe('put /admin/api/users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .put('/admin/api/users/invalid-uuid')
          .send({ name: 'Updated Name' })
          .expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .put('/admin/api/users/00000000-0000-0000-0000-000000000000')
          .send({ name: 'Updated Name' })
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });

      it('should return error with statusCode and errorCode for invalid update data', async () => {
        expect.assertions(3);

        const createDto = {
          firebaseUid: 'uid-update',
          name: 'Update User',
        };

        const createResponse = await request(app.getHttpServer()).post('/admin/api/users').send(createDto).expect(201);

        const response = await request(app.getHttpServer())
          .put(`/admin/api/users/${createResponse.body.publicId}`)
          .send({ email: 'invalid-email' })
          .expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });
    });

    describe('delete /admin/api/users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer()).delete('/admin/api/users/invalid-uuid').expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .delete('/admin/api/users/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });
    });

    describe('post /admin/api/users/bulk', () => {
      it('should return error with statusCode and errorCode for invalid data', async () => {
        expect.assertions(3);

        const invalidDto = {
          users: [{ email: 'invalid-email', name: '' }],
        };

        const response = await request(app.getHttpServer()).post('/admin/api/users/bulk').send(invalidDto).expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for duplicate emails', async () => {
        expect.assertions(3);

        const createDto = {
          users: [
            { email: 'same@example.com', name: 'User 1' },
            { email: 'same@example.com', name: 'User 2' },
          ],
        };

        const response = await request(app.getHttpServer()).post('/admin/api/users/bulk').send(createDto).expect(409);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(409);
      });
    });

    describe('delete /admin/api/users', () => {
      it('should return error with statusCode and errorCode for invalid UUIDs', async () => {
        expect.assertions(3);

        const deleteDto = {
          publicIds: ['invalid-uuid-1', 'invalid-uuid-2'],
        };

        const response = await request(app.getHttpServer()).delete('/admin/api/users').send(deleteDto).expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });
    });
  });
});
