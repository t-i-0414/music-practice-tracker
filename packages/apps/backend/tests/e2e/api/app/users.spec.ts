import { randomUUID } from 'crypto';

import { type INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { createE2ETestHelper, type E2ETestHelper } from '../../helpers';

import { AppApiModule } from '@/modules/api/app/app.module';

describe('app API - /api/users', () => {
  let helper: E2ETestHelper;
  let app: INestApplication;

  beforeAll(async () => {
    helper = createE2ETestHelper();
    await helper.setup([AppApiModule], { enableLogging: false });
    app = helper.getApp();
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  describe('get /api/users/:publicId', () => {
    it('should return user by publicId', async () => {
      expect.assertions(3);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Test User', email: `test-${randomUUID()}@example.com` })
        .expect(201);

      const response = await request(app.getHttpServer()).get(`/api/users/${user.body.publicId}`).expect(200);

      expect(response.body.publicId).toBe(user.body.publicId);
      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toMatch(/test-.*@example\.com/u);
    });

    it('should return 404 for non-existent user', async () => {
      expect.assertions(1);
      await expect(
        request(app.getHttpServer()).get('/api/users/00000000-0000-0000-0000-000000000000'),
      ).resolves.toMatchObject({
        status: 404,
      });
    });
  });

  describe('post /api/users', () => {
    it('should create a new user', async () => {
      expect.assertions(4);

      const userData = {
        name: 'New User',
        email: `new-${randomUUID()}@example.com`,
      };

      const response = await request(app.getHttpServer()).post('/api/users').send(userData).expect(201);

      expect(response.body).toHaveProperty('publicId');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 for invalid data', async () => {
      expect.assertions(1);
      await expect(request(app.getHttpServer()).post('/api/users').send({ name: 'No Email' })).resolves.toMatchObject({
        status: 400,
      });
    });

    it('should return error for duplicate email', async () => {
      expect.assertions(1);

      const email = `duplicate-${randomUUID()}@example.com`;

      await request(app.getHttpServer()).post('/api/users').send({ name: 'User 1', email }).expect(201);

      const response = await request(app.getHttpServer()).post('/api/users').send({ name: 'User 2', email });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('put /api/users/:publicId', () => {
    it('should update user by publicId', async () => {
      expect.assertions(3);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Original Name', email: `original-${randomUUID()}@example.com` })
        .expect(201);

      const updateData = { name: 'Updated Name' };

      const response = await request(app.getHttpServer())
        .put(`/api/users/${user.body.publicId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.publicId).toBe(user.body.publicId);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.email).toBe(user.body.email);
    });
  });
});
