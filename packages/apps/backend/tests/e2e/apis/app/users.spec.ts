import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppApiModule } from '@/apis/app/app.module';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('app Users API (e2e)', () => {
  let app: INestApplication;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
    await databaseHelper.disconnect();
  });

  describe('post /users', () => {
    it('should create a new user', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer()).post('/users').send(createDto).expect(201);

      expect(response.body).toMatchObject({
        email: createDto.email,
        name: createDto.name,
      });
      expect(response.body.publicId).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      expect.assertions(1);

      const invalidDto = {
        email: 'invalid-email',
        name: '',
      };

      const response = await request(app.getHttpServer()).post('/users').send(invalidDto).expect(400);

      expect(response.status).toBe(400);
    });
  });

  describe('get /users/:publicId', () => {
    it('should get a user by public ID', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'get@example.com',
        name: 'Get User',
      };

      const createResponse = await request(app.getHttpServer()).post('/users').send(createDto).expect(201);

      const { publicId } = createResponse.body;

      const getResponse = await request(app.getHttpServer()).get(`/users/${publicId}`).expect(200);

      expect(getResponse.body).toMatchObject({
        publicId,
        email: createDto.email,
        name: createDto.name,
      });
    });

    it('should return 404 for non-existent user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('put /users/:publicId', () => {
    it('should update a user', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'update@example.com',
        name: 'Original Name',
      };

      const createResponse = await request(app.getHttpServer()).post('/users').send(createDto).expect(201);

      const { publicId } = createResponse.body;
      const updateDto = { name: 'Updated Name' };

      const updateResponse = await request(app.getHttpServer()).put(`/users/${publicId}`).send(updateDto).expect(200);

      expect(updateResponse.body).toMatchObject({
        publicId,
        email: createDto.email,
        name: updateDto.name,
      });
    });

    it('should return 404 for non-existent user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .put('/users/00000000-0000-0000-0000-000000000000')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('delete /users/:publicId', () => {
    it('should delete a user', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'delete@example.com',
        name: 'Delete User',
      };

      const createResponse = await request(app.getHttpServer()).post('/users').send(createDto).expect(201);

      const { publicId } = createResponse.body;

      const deleteResponse = await request(app.getHttpServer()).delete(`/users/${publicId}`).expect(204);

      const getResponse = await request(app.getHttpServer()).get(`/users/${publicId}`).expect(404);

      expect(deleteResponse.status).toBe(204);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .delete('/users/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('apiStandardResponses error format validation', () => {
    describe('post /users', () => {
      it('should return error with statusCode and errorCode for validation errors', async () => {
        expect.assertions(3);

        const invalidDto = {
          email: 'invalid-email',
          name: '',
        };

        const response = await request(app.getHttpServer()).post('/users').send(invalidDto).expect(400);

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

        await request(app.getHttpServer()).post('/users').send(createDto).expect(201);

        const response = await request(app.getHttpServer()).post('/users').send(createDto).expect(409);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(409);
      });
    });

    describe('get /users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer()).get('/users/invalid-uuid').expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .get('/users/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });
    });

    describe('put /users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .put('/users/invalid-uuid')
          .send({ name: 'Updated Name' })
          .expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .put('/users/00000000-0000-0000-0000-000000000000')
          .send({ name: 'Updated Name' })
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });

      it('should return error with statusCode and errorCode for invalid update data', async () => {
        expect.assertions(3);

        const createDto = {
          email: 'update@example.com',
          name: 'Update User',
        };

        const createResponse = await request(app.getHttpServer()).post('/users').send(createDto).expect(201);

        const response = await request(app.getHttpServer())
          .put(`/users/${createResponse.body.publicId}`)
          .send({ email: 'invalid-email' })
          .expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });
    });

    describe('delete /users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer()).delete('/users/invalid-uuid').expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .delete('/users/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });
    });
  });
});
