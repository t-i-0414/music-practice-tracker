import { randomUUID } from 'crypto';

import { type INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { createE2ETestHelper, type E2ETestHelper } from '../../helpers';

import { AdminApiModule } from '@/modules/api/admin/admin.module';

describe('admin API - /api/users', () => {
  let helper: E2ETestHelper;
  let app: INestApplication;

  beforeAll(async () => {
    helper = createE2ETestHelper();
    await helper.setup([AdminApiModule], { enableLogging: false });
    app = helper.getApp();
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  describe('gET /api/users/active_users', () => {
    it('should return users by IDs', async () => {
      expect.assertions(5);

      const user1 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'User 1', email: `user1-${randomUUID()}@example.com` })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'User 2', email: `user2-${randomUUID()}@example.com` })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/users/active_users?ids=${user1.body.id}&ids=${user2.body.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(2);
      expect(response.body.users.some((u: any) => u.id === user1.body.id)).toBe(true);
      expect(response.body.users.some((u: any) => u.id === user2.body.id)).toBe(true);
    });
  });

  describe('gET /api/users/deleted_users', () => {
    it('should return deleted users', async () => {
      expect.assertions(4);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Deleted User', email: `deleted-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/users/${user.body.id}`).expect(204);

      const response = await request(app.getHttpServer())
        .get(`/api/users/deleted_users?ids=${user.body.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].id).toBe(user.body.id);
    });
  });

  describe('gET /api/users/any_users', () => {
    it('should return both active and deleted users', async () => {
      expect.assertions(6);

      const activeUser = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Active User', email: `active-${randomUUID()}@example.com` })
        .expect(201);

      const deletedUser = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Deleted User', email: `deleted-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/users/${deletedUser.body.id}`).expect(204);

      const response = await request(app.getHttpServer())
        .get(`/api/users/any_users?ids=${activeUser.body.id}&ids=${deletedUser.body.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(2);

      const activeUserInResponse = response.body.users.find((u: any) => u.id === activeUser.body.id);

      expect(activeUserInResponse).toBeTruthy();

      const deletedUserInResponse = response.body.users.find((u: any) => u.id === deletedUser.body.id);

      expect(deletedUserInResponse).toBeTruthy();
      expect(deletedUserInResponse.deletedAt).not.toBeNull();
    });
  });

  describe('gET /api/users/active_users/:id', () => {
    it('should return active user by ID', async () => {
      expect.assertions(3);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Test User', email: `test-${randomUUID()}@example.com` })
        .expect(201);

      const response = await request(app.getHttpServer()).get(`/api/users/active_users/${user.body.id}`).expect(200);

      expect(response.body.id).toBe(user.body.id);
      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toMatch(/test-.*@example\.com/u);
    });

    it('should return 404 for non-existent user', async () => {
      expect.assertions(1);
      await expect(
        request(app.getHttpServer()).get('/api/users/active_users/00000000-0000-0000-0000-000000000000'),
      ).resolves.toMatchObject({
        status: 404,
      });
    });
  });

  describe('gET /api/users/deleted_users/:id', () => {
    it('should return deleted user by ID', async () => {
      expect.assertions(3);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Delete', email: `delete-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/users/${user.body.id}`).expect(204);

      const response = await request(app.getHttpServer()).get(`/api/users/deleted_users/${user.body.id}`).expect(200);

      expect(response.body.id).toBe(user.body.id);
      expect(response.body.name).toBe('To Delete');
      expect(response.body.deletedAt).not.toBeNull();
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

  describe('pOST /api/users/bulk', () => {
    it('should create multiple users', async () => {
      expect.assertions(4);

      const users = [
        { name: 'Bulk User 1', email: `bulk1-${randomUUID()}@example.com` },
        { name: 'Bulk User 2', email: `bulk2-${randomUUID()}@example.com` },
        { name: 'Bulk User 3', email: `bulk3-${randomUUID()}@example.com` },
      ];

      const response = await request(app.getHttpServer()).post('/api/users/bulk').send({ users }).expect(201);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(3);

      const emails = response.body.users.map((u: any) => u.email);

      expect(emails.sort()).toStrictEqual(users.map((u) => u.email).sort());
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

      await request(app.getHttpServer()).delete(`/api/users/${user.body.id}`).expect(204);

      // Verify user is soft deleted
      const response = await request(app.getHttpServer()).get(`/api/users/deleted_users/${user.body.id}`).expect(200);

      expect(response.body.deletedAt).not.toBeNull();
    });
  });
});
