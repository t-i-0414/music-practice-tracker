import { randomUUID } from 'crypto';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { type INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { createE2ETestHelper, type E2ETestHelper } from '../../helpers';

import { AdminApiModule } from '@/modules/api/admin/admin.module';

describe('admin API - /api/users', () => {
  let helper: E2ETestHelper;
  let app: INestApplication;

  beforeAll(async () => {
    helper = createE2ETestHelper();
    await helper.setup([AdminApiModule]);
    app = helper.getApp();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  describe('gET /api/users/active_users', () => {
    it('should return users by IDs', async () => {
      const user1 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'User 1', email: `user1-${randomUUID()}@example.com` })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'User 2', email: `user2-${randomUUID()}@example.com` })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/api/users/active_users?ids=${user1.body.id}&ids=${user2.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(Array.isArray(res.body.users)).toBeTruthy();
          expect(res.body.users).toHaveLength(2);
          expect(res.body.users.some((u: any) => u.id === user1.body.id)).toBeTruthy();
          expect(res.body.users.some((u: any) => u.id === user2.body.id)).toBeTruthy();
        });
    });
  });

  describe('pOST /api/users', () => {
    it('should create a user', () => {
      const createDto = {
        name: 'Admin Test User',
        email: `admin-test-${randomUUID()}@example.com`,
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
  });

  describe('pOST /api/users/bulk', () => {
    it('should create multiple users', () => {
      const createDto = {
        users: [
          { name: 'Bulk User 1', email: `bulk1-${randomUUID()}@example.com` },
          { name: 'Bulk User 2', email: `bulk2-${randomUUID()}@example.com` },
        ],
      };

      return request(app.getHttpServer())
        .post('/api/users/bulk')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body.users).toHaveLength(2);
          expect(res.body.users[0].name).toBe('Bulk User 1');
          expect(res.body.users[1].name).toBe('Bulk User 2');
        });
    });
  });

  describe('dELETE /api/users/:id', () => {
    it('should soft delete a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Delete', email: `delete-${randomUUID()}@example.com` })
        .expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer()).delete(`/api/users/${userId}`).expect(204);

      await request(app.getHttpServer()).get(`/api/users/active_users/${userId}`).expect(404);

      await request(app.getHttpServer()).get(`/api/users/deleted_users/${userId}`).expect(200);
    });
  });

  describe('pUT /api/users/:id/restore', () => {
    it('should restore a soft-deleted user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Restore', email: `restore-${randomUUID()}@example.com` })
        .expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer()).delete(`/api/users/${userId}`).expect(204);

      await request(app.getHttpServer())
        .put(`/api/users/${userId}/restore`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.name).toBe('To Restore');
        });

      await request(app.getHttpServer()).get(`/api/users/active_users/${userId}`).expect(200);
    });
  });

  describe('dELETE /api/users/hard/:id', () => {
    it('should permanently delete a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Hard Delete', email: `hard-delete-${randomUUID()}@example.com` })
        .expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer()).delete(`/api/users/hard/${userId}`).expect(204);

      await request(app.getHttpServer()).get(`/api/users/any_users/${userId}`).expect(404);
    });
  });

  describe('dELETE /api/users/bulk', () => {
    it('should soft delete multiple users', async () => {
      const user1 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Delete 1', email: `bulk-del1-${randomUUID()}@example.com` })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Delete 2', email: `bulk-del2-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer())
        .delete('/api/users/bulk')
        .send({ ids: [user1.body.id, user2.body.id] })
        .expect(204);

      await request(app.getHttpServer()).get(`/api/users/active_users/${user1.body.id}`).expect(404);

      await request(app.getHttpServer()).get(`/api/users/active_users/${user2.body.id}`).expect(404);
    });
  });

  describe('pUT /api/users/restore/bulk', () => {
    it('should restore multiple soft-deleted users', async () => {
      const user1 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Restore 1', email: `bulk-res1-${randomUUID()}@example.com` })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Restore 2', email: `bulk-res2-${randomUUID()}@example.com` })
        .expect(201);

      await request(app.getHttpServer())
        .delete('/api/users/bulk')
        .send({ ids: [user1.body.id, user2.body.id] })
        .expect(204);

      const restoreResponse = await request(app.getHttpServer())
        .put('/api/users/restore/bulk')
        .send({ ids: [user1.body.id, user2.body.id] })
        .expect(200);

      expect(restoreResponse.body.users).toHaveLength(2);
      expect(restoreResponse.body.users.map((u: any) => u.id)).toContain(user1.body.id);
      expect(restoreResponse.body.users.map((u: any) => u.id)).toContain(user2.body.id);
    });
  });

  describe('gET /api/users/any_users/:id', () => {
    it('should find both active and deleted users', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Any User', email: `any-${randomUUID()}@example.com` })
        .expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer()).get(`/api/users/any_users/${userId}`).expect(200);

      await request(app.getHttpServer()).delete(`/api/users/${userId}`).expect(204);

      await request(app.getHttpServer())
        .get(`/api/users/any_users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.deletedAt).not.toBeNull();
        });
    });
  });
});
