import { HttpStatus, type INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { E2ETestHelper } from '../../helpers';

import { AdminRole, AdminStatus, type PrismaClient } from '@/generated/prisma';
import { AdminApiModule } from '@/apis/admin/admin.module';
import { getPrismaClient } from '@/tests/helpers/database-test-utils';

describe('admin API - AdminUsers (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  const testHelper = new E2ETestHelper();

  beforeAll(async () => {
    const { app: setupApp } = await testHelper.setup([AdminApiModule]);
    app = setupApp;
    prisma = getPrismaClient();
  });

  beforeEach(async () => {
    await testHelper.cleanupBeforeEach();
  });

  afterAll(async () => {
    await testHelper.teardown();
  });

  describe('get /admin-users', () => {
    it('should return an array of admin users', async () => {
      expect.assertions(4);

      const adminUsers = await Promise.all([
        prisma.adminUser.create({
          data: {
            name: 'E2E Admin 1',
            email: 'e2e-admin1@test.com',
            role: AdminRole.VIEWER,
            status: AdminStatus.ACTIVE,
          },
        }),
        prisma.adminUser.create({
          data: {
            name: 'E2E Admin 2',
            email: 'e2e-admin2@test.com',
            role: AdminRole.ADMIN,
            status: AdminStatus.ACTIVE,
          },
        }),
      ]);

      const response = await request(app.getHttpServer()).get('/api/admin-users').expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('adminUsers');
      expect(response.body.adminUsers).toBeInstanceOf(Array);
      expect(response.body.adminUsers.length).toBeGreaterThanOrEqual(2);
      expect(response.body.adminUsers).toContainEqual(
        expect.objectContaining({
          publicId: adminUsers[0].publicId,
          name: 'E2E Admin 1',
          email: 'e2e-admin1@test.com',
          role: AdminRole.VIEWER,
        }),
      );
    });

    it('should support pagination', async () => {
      expect.assertions(2);

      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          prisma.adminUser.create({
            data: {
              name: `Paginated Admin ${i}`,
              email: `paginated-admin${i}@test.com`,
              role: AdminRole.VIEWER,
            },
          }),
        ),
      );

      const response = await request(app.getHttpServer()).get('/api/admin-users?skip=1&take=2').expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('adminUsers');
      expect(response.body.adminUsers).toBeInstanceOf(Array);
    });
  });

  describe('get /admin-users with publicIds query', () => {
    it('should return admin users by public IDs', async () => {
      expect.assertions(4);

      const adminUsers = await Promise.all([
        prisma.adminUser.create({
          data: {
            name: 'Admin By ID 1',
            email: 'admin-by-id1@test.com',
            role: AdminRole.VIEWER,
          },
        }),
        prisma.adminUser.create({
          data: {
            name: 'Admin By ID 2',
            email: 'admin-by-id2@test.com',
            role: AdminRole.ADMIN,
          },
        }),
      ]);

      const response = await request(app.getHttpServer())
        .get(`/api/admin-users?publicIds=${adminUsers[0].publicId}&publicIds=${adminUsers[1].publicId}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('adminUsers');
      expect(response.body.adminUsers).toBeInstanceOf(Array);
      expect(response.body.adminUsers).toHaveLength(2);
      expect(response.body.adminUsers).toContainEqual(
        expect.objectContaining({
          publicId: adminUsers[0].publicId,
        }),
      );
    });
  });

  describe('get /admin-users/:publicId', () => {
    it('should return an admin user by public ID', async () => {
      expect.assertions(2);

      const adminUser = await prisma.adminUser.create({
        data: {
          name: 'Get By ID Admin',
          email: 'get-by-id@test.com',
          role: AdminRole.EDITOR,
          status: AdminStatus.ACTIVE,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/admin-users/${adminUser.publicId}`)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        publicId: adminUser.publicId,
        name: 'Get By ID Admin',
        email: 'get-by-id@test.com',
        role: AdminRole.EDITOR,
        status: AdminStatus.ACTIVE,
      });
      expect(response.body).not.toHaveProperty('id');
    });

    it('should return 404 for non-existent admin user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .get('/api/admin-users/00000000-0000-0000-0000-000000000000')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.NOT_FOUND,
        message: expect.any(String),
      });
    });
  });

  describe('post /admin-users', () => {
    it('should create a new admin user', async () => {
      expect.assertions(3);

      const newAdminUser = {
        name: 'New Admin User',
        email: 'new-admin@test.com',
        role: AdminRole.VIEWER,
      };

      const response = await request(app.getHttpServer())
        .post('/api/admin-users')
        .send(newAdminUser)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        publicId: expect.any(String),
        name: newAdminUser.name,
        email: newAdminUser.email,
        role: newAdminUser.role,
        status: AdminStatus.PENDING,
      });
      expect(response.body).not.toHaveProperty('id');

      const createdAdminUser = await prisma.adminUser.findUnique({
        where: { publicId: response.body.publicId },
      });

      expect(createdAdminUser).toBeTruthy();
    });

    it('should return 400 for invalid input', async () => {
      expect.assertions(1);

      const invalidAdminUser = {
        name: 'Invalid Admin',
        email: 'invalid-email',
        role: AdminRole.VIEWER,
      };

      const response = await request(app.getHttpServer())
        .post('/api/admin-users')
        .send(invalidAdminUser)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.arrayContaining(['email must be an email']),
      });
    });
  });

  describe('put /admin-users/:publicId', () => {
    it('should update an admin user', async () => {
      expect.assertions(4);

      const adminUser = await prisma.adminUser.create({
        data: {
          name: 'Original Name',
          email: 'original-email@test.com',
          role: AdminRole.VIEWER,
          status: AdminStatus.PENDING,
        },
      });

      const updateData = {
        name: 'Updated Name',
        role: AdminRole.ADMIN,
        status: AdminStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/admin-users/${adminUser.publicId}`)
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        publicId: adminUser.publicId,
        name: updateData.name,
        email: adminUser.email,
        role: updateData.role,
        status: updateData.status,
      });

      const updatedAdminUser = await prisma.adminUser.findUnique({
        where: { publicId: adminUser.publicId },
      });

      expect(updatedAdminUser?.name).toBe(updateData.name);
      expect(updatedAdminUser?.role).toBe(updateData.role);
      expect(updatedAdminUser?.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent admin user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .put('/api/admin-users/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated Name' })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.NOT_FOUND,
        message: expect.any(String),
      });
    });
  });

  describe('delete /admin-users/:publicId', () => {
    it('should delete an admin user', async () => {
      expect.assertions(1);

      const adminUser = await prisma.adminUser.create({
        data: {
          name: 'To Delete Admin',
          email: 'to-delete@test.com',
          role: AdminRole.VIEWER,
        },
      });

      await request(app.getHttpServer()).delete(`/api/admin-users/${adminUser.publicId}`).expect(HttpStatus.NO_CONTENT);

      const deletedAdminUser = await prisma.adminUser.findUnique({
        where: { publicId: adminUser.publicId },
      });

      expect(deletedAdminUser).toBeNull();
    });

    it('should return 404 for non-existent admin user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .delete('/api/admin-users/00000000-0000-0000-0000-000000000000')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.NOT_FOUND,
        message: expect.any(String),
      });
    });
  });
});
