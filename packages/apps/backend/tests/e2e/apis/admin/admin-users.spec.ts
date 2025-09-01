import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AdminApiModule } from '@/apis/admin/admin.module';
import { AdminRole } from '@/generated/prisma';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('admin AdminUsers API (e2e)', () => {
  let app: INestApplication;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('admin');
    await app.init();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
    await databaseHelper.disconnect();
  });

  describe('pOST /admin/admin-users', () => {
    it('should create a new admin user', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'admin@example.com',
        name: 'Admin User',
        role: AdminRole.ADMIN,
      };

      const response = await request(app.getHttpServer()).post('/admin/admin-users').send(createDto).expect(201);

      expect(response.body).toMatchObject({
        email: createDto.email,
        name: createDto.name,
        role: createDto.role,
      });
      expect(response.body.publicId).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      expect.assertions(1);

      const invalidDto = {
        email: 'invalid-email',
        name: '',
        role: 'INVALID_ROLE',
      };

      const response = await request(app.getHttpServer()).post('/admin/admin-users').send(invalidDto).expect(400);

      expect(response.status).toBe(400);
    });
  });

  describe('gET /admin/admin-users', () => {
    it('should get all admin users', async () => {
      expect.assertions(3);

      const adminUsers = [
        { email: 'admin1@example.com', name: 'Admin 1', role: AdminRole.VIEWER },
        { email: 'admin2@example.com', name: 'Admin 2', role: AdminRole.ADMIN },
      ];

      await Promise.all(
        adminUsers.map((adminUser) =>
          request(app.getHttpServer()).post('/admin/admin-users').send(adminUser).expect(201),
        ),
      );

      const response = await request(app.getHttpServer()).get('/admin/admin-users').expect(200);

      expect(response.body.adminUsers).toHaveLength(2);
      expect(response.body.adminUsers[0].email).toBe('admin1@example.com');
      expect(response.body.adminUsers[1].email).toBe('admin2@example.com');
    });

    it('should get admin users by public IDs', async () => {
      expect.assertions(2);

      const createResponse1 = await request(app.getHttpServer())
        .post('/admin/admin-users')
        .send({ email: 'admin1@example.com', name: 'Admin 1', role: AdminRole.VIEWER })
        .expect(201);

      const createResponse2 = await request(app.getHttpServer())
        .post('/admin/admin-users')
        .send({ email: 'admin2@example.com', name: 'Admin 2', role: AdminRole.ADMIN })
        .expect(201);

      await request(app.getHttpServer())
        .post('/admin/admin-users')
        .send({ email: 'admin3@example.com', name: 'Admin 3', role: AdminRole.VIEWER })
        .expect(201);

      const publicIds = [createResponse1.body.publicId, createResponse2.body.publicId];
      const response = await request(app.getHttpServer()).get('/admin/admin-users').query({ publicIds }).expect(200);

      expect(response.body.adminUsers).toHaveLength(2);
      expect(response.body.adminUsers.map((u: any) => u.publicId)).toStrictEqual(expect.arrayContaining(publicIds));
    });
  });

  describe('gET /admin/admin-users/:publicId', () => {
    it('should get an admin user by public ID', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'get@example.com',
        name: 'Get Admin',
        role: AdminRole.ADMIN,
      };

      const createResponse = await request(app.getHttpServer()).post('/admin/admin-users').send(createDto).expect(201);

      const { publicId } = createResponse.body;

      const getResponse = await request(app.getHttpServer()).get(`/admin/admin-users/${publicId}`).expect(200);

      expect(getResponse.body).toMatchObject({
        publicId,
        email: createDto.email,
        name: createDto.name,
        role: createDto.role,
      });
    });

    it('should return 404 for non-existent admin user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .get('/admin/admin-users/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('pUT /admin/admin-users/:publicId', () => {
    it('should update an admin user', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'update@example.com',
        name: 'Original Name',
        role: AdminRole.VIEWER,
      };

      const createResponse = await request(app.getHttpServer()).post('/admin/admin-users').send(createDto).expect(201);

      const { publicId } = createResponse.body;
      const updateDto = {
        name: 'Updated Name',
        role: AdminRole.ADMIN,
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/admin/admin-users/${publicId}`)
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body).toMatchObject({
        publicId,
        email: createDto.email,
        name: updateDto.name,
        role: updateDto.role,
      });
    });

    it('should return 404 for non-existent admin user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .put('/admin/admin-users/00000000-0000-0000-0000-000000000000')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('dELETE /admin/admin-users/:publicId', () => {
    it('should delete an admin user', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'delete@example.com',
        name: 'Delete Admin',
        role: AdminRole.VIEWER,
      };

      const createResponse = await request(app.getHttpServer()).post('/admin/admin-users').send(createDto).expect(201);

      const { publicId } = createResponse.body;

      const deleteResponse = await request(app.getHttpServer()).delete(`/admin/admin-users/${publicId}`).expect(204);

      const getResponse = await request(app.getHttpServer()).get(`/admin/admin-users/${publicId}`).expect(404);

      expect(deleteResponse.status).toBe(204);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent admin user', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .delete('/admin/admin-users/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('pOST /admin/admin-users/bulk', () => {
    it('should create multiple admin users', async () => {
      expect.assertions(4);

      const createDto = {
        adminUsers: [
          { email: 'bulk1@example.com', name: 'Bulk 1', role: AdminRole.VIEWER },
          { email: 'bulk2@example.com', name: 'Bulk 2', role: AdminRole.ADMIN },
          { email: 'bulk3@example.com', name: 'Bulk 3', role: AdminRole.VIEWER },
        ],
      };

      const response = await request(app.getHttpServer()).post('/admin/admin-users/bulk').send(createDto).expect(201);

      expect(response.body.adminUsers).toHaveLength(3);
      expect(response.body.adminUsers[0].email).toBe('bulk1@example.com');
      expect(response.body.adminUsers[1].email).toBe('bulk2@example.com');
      expect(response.body.adminUsers[2].email).toBe('bulk3@example.com');
    });
  });

  describe('dELETE /admin/admin-users', () => {
    it('should delete multiple admin users', async () => {
      expect.assertions(2);

      const adminUsers: any[] = [];
      const createPromises = Array.from({ length: 3 }, (_, i) =>
        request(app.getHttpServer())
          .post('/admin/admin-users')
          .send({ email: `del${i + 1}@example.com`, name: `Delete ${i + 1}`, role: AdminRole.VIEWER })
          .expect(201),
      );

      const responses = await Promise.all(createPromises);
      adminUsers.push(...responses.map((response) => response.body));

      const publicIdsToDelete = [adminUsers[0].publicId, adminUsers[1].publicId];

      await request(app.getHttpServer())
        .delete('/admin/admin-users')
        .send({ publicIds: publicIdsToDelete })
        .expect(204);

      const remainingAdminUsers = await request(app.getHttpServer()).get('/admin/admin-users').expect(200);

      expect(remainingAdminUsers.body.adminUsers).toHaveLength(1);
      expect(remainingAdminUsers.body.adminUsers[0].publicId).toBe(adminUsers[2].publicId);
    });
  });
});
