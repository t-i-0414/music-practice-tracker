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
        .get(`/api/users/active_users?publicIds=${user1.body.publicId}&publicIds=${user2.body.publicId}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(2);
      expect(response.body.users.some((u: any) => u.publicId === user1.body.publicId)).toBe(true);
      expect(response.body.users.some((u: any) => u.publicId === user2.body.publicId)).toBe(true);
    });
  });

  describe('gET /api/users/deleted_users', () => {
    it('should return deleted users', async () => {
      expect.assertions(4);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Deleted User', email: `deleted-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/users/${user.body.publicId}`).expect(204);

      const response = await request(app.getHttpServer())
        .get(`/api/users/deleted_users?publicIds=${user.body.publicId}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].publicId).toBe(user.body.publicId);
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

      await request(app.getHttpServer()).delete(`/api/users/${deletedUser.body.publicId}`).expect(204);

      const response = await request(app.getHttpServer())
        .get(`/api/users/any_users?publicIds=${activeUser.body.publicId}&publicIds=${deletedUser.body.publicId}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(2);

      const activeUserInResponse = response.body.users.find((u: any) => u.publicId === activeUser.body.publicId);

      expect(activeUserInResponse).toBeTruthy();

      const deletedUserInResponse = response.body.users.find((u: any) => u.publicId === deletedUser.body.publicId);

      expect(deletedUserInResponse).toBeTruthy();
      expect(deletedUserInResponse.deletedAt).not.toBeNull();
    });
  });

  describe('gET /api/users/active_users/:publicId', () => {
    it('should return active user by publicId', async () => {
      expect.assertions(3);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Test User', email: `test-${randomUUID()}@example.com` })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/users/active_users/${user.body.publicId}`)
        .expect(200);

      expect(response.body.publicId).toBe(user.body.publicId);
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

  describe('gET /api/users/deleted_users/:publicId', () => {
    it('should return deleted user by publicId', async () => {
      expect.assertions(3);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Delete', email: `delete-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/users/${user.body.publicId}`).expect(204);

      const response = await request(app.getHttpServer())
        .get(`/api/users/deleted_users/${user.body.publicId}`)
        .expect(200);

      expect(response.body.publicId).toBe(user.body.publicId);
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

  describe('pUT /api/users/:publicId', () => {
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

  describe('dELETE /api/users/:publicId', () => {
    it('should soft delete user by publicId', async () => {
      expect.assertions(1);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Delete', email: `delete-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/users/${user.body.publicId}`).expect(204);

      // Verify user is soft deleted
      const response = await request(app.getHttpServer())
        .get(`/api/users/deleted_users/${user.body.publicId}`)
        .expect(200);

      expect(response.body.deletedAt).not.toBeNull();
    });
  });

  describe('pUT /api/users/:publicId/suspend', () => {
    it('should suspend user by publicId', async () => {
      expect.assertions(2);

      const user = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Suspend', email: `suspend-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer()).put(`/api/users/${user.body.publicId}/suspend`).expect(204);

      // Verify user is suspended
      const response = await request(app.getHttpServer())
        .get(`/api/users/suspended_users/${user.body.publicId}`)
        .expect(200);

      expect(response.body.publicId).toBe(user.body.publicId);
      expect(response.body.suspendedAt).not.toBeNull();
    });
  });

  describe('pUT /api/users/suspend/bulk', () => {
    it('should suspend multiple users', async () => {
      expect.assertions(4);

      const user1 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Suspend 1', email: `bulk-suspend-1-${randomUUID()}@example.com` })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Suspend 2', email: `bulk-suspend-2-${randomUUID()}@example.com` })
        .expect(201);

      const publicIds = [user1.body.publicId, user2.body.publicId];

      await request(app.getHttpServer()).put('/api/users/suspend/bulk').send({ publicIds }).expect(204);

      // Verify users are suspended
      const response = await request(app.getHttpServer())
        .get(`/api/users/suspended_users?publicIds=${publicIds.join('&publicIds=')}`)
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.users.every((u: any) => u.suspendedAt !== null)).toBe(true);
      expect(response.body.users.some((u: any) => u.publicId === user1.body.publicId)).toBe(true);
      expect(response.body.users.some((u: any) => u.publicId === user2.body.publicId)).toBe(true);
    });
  });
});
