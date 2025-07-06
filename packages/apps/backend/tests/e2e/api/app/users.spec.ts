import { randomUUID } from 'crypto';

import { ClassSerializerInterceptor, type INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppApiModule } from '@/modules/api/app/app.module';

describe('App API - /api/users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users', () => {
    it('should create a user', () => {
      const createDto = {
        name: 'Test User',
        email: `test-${randomUUID()}@example.com`,
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: expect.any(String),
            name: createDto.name,
            email: createDto.email,
          });
        });
    });

    it('should validate email', () => {
      const invalidDto = {
        name: 'Test User',
        email: 'invalid-email',
      };

      return request(app.getHttpServer()).post('/api/users').send(invalidDto).expect(400);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 400 for invalid UUID', () =>
      request(app.getHttpServer()).get('/api/users/invalid-uuid').expect(400));

    it('should return 404 for non-existent user', () =>
      request(app.getHttpServer()).get('/api/users/00000000-0000-0000-0000-000000000000').expect(404));
  });

  describe('PUT /api/users/:id', () => {
    it('should update user data', async () => {
      const createDto = {
        name: 'Original User',
        email: `original-${randomUUID()}@example.com`,
      };

      const createResponse = await request(app.getHttpServer()).post('/api/users').send(createDto).expect(201);

      const userId = createResponse.body.id;

      const updateDto = {
        name: 'Updated User',
      };

      return request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateDto.name);
          expect(res.body.email).toBe(createDto.email);
        });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const createDto = {
        name: 'To Delete User',
        email: `delete-${randomUUID()}@example.com`,
      };

      const createResponse = await request(app.getHttpServer()).post('/api/users').send(createDto).expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer()).delete(`/api/users/${userId}`).expect(204);

      await request(app.getHttpServer()).get(`/api/users/${userId}`).expect(404);
    });
  });
});
