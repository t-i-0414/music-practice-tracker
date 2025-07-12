import { randomUUID } from 'crypto';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { type INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { createE2ETestHelper, type E2ETestHelper } from '../../helpers/e2e-test-utils';

import { AppApiModule } from '@/modules/api/app/app.module';

describe('app API - /api/users', () => {
  let helper: E2ETestHelper;
  let app: INestApplication;

  beforeAll(async () => {
    helper = createE2ETestHelper();
    await helper.setup([AppApiModule]);
    app = helper.getApp();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  describe('pOST /api/users', () => {
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

  describe('gET /api/users/:id', () => {
    it('should return 400 for invalid UUID', () =>
      request(app.getHttpServer()).get('/api/users/invalid-uuid').expect(400));

    it('should return 404 for non-existent user', () =>
      request(app.getHttpServer()).get('/api/users/00000000-0000-0000-0000-000000000000').expect(404));
  });

  describe('pUT /api/users/:id', () => {
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

  describe('dELETE /api/users/:id', () => {
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
