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

  describe('gET /api/users/:id', () => {
    it('should return active user by ID', async () => {
      expect.assertions(3);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Test User', email: `test-${randomUUID()}@example.com` })
        .expect(201);

      const response = await request(app.getHttpServer()).get(`/api/users/${user.body.id}`).expect(200);

      expect(response.body.id).toBe(user.body.id);
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

    it('should return 404 for deleted user', async () => {
      expect.assertions(1);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Delete', email: `delete-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/users/${user.body.id}`).expect(204);

      await expect(request(app.getHttpServer()).get(`/api/users/${user.body.id}`)).resolves.toMatchObject({
        status: 404,
      });
    });

    it('should return 400 for invalid UUID', async () => {
      expect.assertions(1);
      await expect(request(app.getHttpServer()).get('/api/users/invalid-uuid')).resolves.toMatchObject({
        status: 400,
      });
    });
  });

  describe('pOST /api/users', () => {
    it('should create a new user', async () => {
      expect.assertions(4);

      const userData = {
        name: 'New User',
        email: `new-${randomUUID()}@example.com`,
      };

      const response = await request(app.getHttpServer()).post('/api/users').send(userData).expect(201);

      expect(response.body).toHaveProperty('id');
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

  describe('pUT /api/users/:id', () => {
    it('should update user by ID', async () => {
      expect.assertions(3);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Original Name', email: `original-${randomUUID()}@example.com` })
        .expect(201);

      const updateData = { name: 'Updated Name' };

      const response = await request(app.getHttpServer())
        .put(`/api/users/${user.body.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(user.body.id);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.email).toBe(user.body.email);
    });
  });

  describe('dELETE /api/users/:id', () => {
    it('should soft delete user by ID', async () => {
      expect.assertions(1);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Delete', email: `delete-${randomUUID()}@example.com` })
        .expect(201);

      await expect(request(app.getHttpServer()).delete(`/api/users/${user.body.id}`)).resolves.toMatchObject({
        status: 204,
      });
    });
  });
});
