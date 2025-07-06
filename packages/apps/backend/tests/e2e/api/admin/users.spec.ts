import { randomUUID } from 'crypto';

import { ClassSerializerInterceptor, type INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AdminApiModule } from '@/modules/api/admin/admin.module';

describe('Admin API - /api/users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/active_users', () => {
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
        });
    });
  });

  describe('POST /api/users', () => {
    it('should create a user', () => {
      const createDto = {
        name: 'Admin Test User',
        email: `admin-test-${Date.now()}@example.com`,
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

  describe('POST /api/users/bulk', () => {
    it('should create multiple users', () => {
      const createDto = {
        users: [
          { name: 'Bulk User 1', email: `bulk1-${Date.now()}@example.com` },
          { name: 'Bulk User 2', email: `bulk2-${Date.now()}@example.com` },
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

  describe('DELETE /api/users/:id', () => {
    it('should soft delete a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Delete', email: `delete-${Date.now()}@example.com` })
        .expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer()).delete(`/api/users/${userId}`).expect(204);

      await request(app.getHttpServer()).get(`/api/users/active_users/${userId}`).expect(404);

      await request(app.getHttpServer()).get(`/api/users/deleted_users/${userId}`).expect(200);
    });
  });

  describe('PUT /api/users/:id/restore', () => {
    it('should restore a soft-deleted user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Restore', email: `restore-${Date.now()}@example.com` })
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

  describe('DELETE /api/users/hard/:id', () => {
    it('should permanently delete a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'To Hard Delete', email: `hard-delete-${Date.now()}@example.com` })
        .expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer()).delete(`/api/users/hard/${userId}`).expect(204);

      await request(app.getHttpServer()).get(`/api/users/any_users/${userId}`).expect(404);
    });
  });

  describe('DELETE /api/users/bulk', () => {
    it('should soft delete multiple users', async () => {
      const user1 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Delete 1', email: `bulk-del1-${Date.now()}@example.com` })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Delete 2', email: `bulk-del2-${Date.now()}@example.com` })
        .expect(201);

      await request(app.getHttpServer())
        .delete('/api/users/bulk')
        .send({ ids: [user1.body.id, user2.body.id] })
        .expect(204);

      await request(app.getHttpServer()).get(`/api/users/active_users/${user1.body.id}`).expect(404);

      await request(app.getHttpServer()).get(`/api/users/active_users/${user2.body.id}`).expect(404);
    });
  });

  describe('PUT /api/users/restore/bulk', () => {
    it('should restore multiple soft-deleted users', async () => {
      const user1 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Restore 1', email: `bulk-res1-${Date.now()}@example.com` })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Bulk Restore 2', email: `bulk-res2-${Date.now()}@example.com` })
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

  describe('GET /api/users/any_users/:id', () => {
    it('should find both active and deleted users', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Any User', email: `any-${Date.now()}@example.com` })
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
