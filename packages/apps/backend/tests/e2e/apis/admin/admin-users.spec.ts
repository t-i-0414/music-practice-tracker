import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AdminApiModule } from '@/apis/admin/admin.module';
import { AdminRole } from '@/generated/prisma';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('e2e AdminApiUsersController', () => {
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    await app.init();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
    await databaseHelper.disconnect();
  });

  describe('post /admin/api/admin-users', () => {
    it('should create a new admin user', async () => {
      expect.assertions(2);

      const createDto = {
        cognitoSub: 'sub-admin@example.com',
        name: 'Admin User',
        role: AdminRole.ADMIN,
      };

      const response = await request(app.getHttpServer()).post('/admin/api/admin-users').send(createDto).expect(201);

      expect(response.body).toMatchObject({
        cognitoSub: createDto.cognitoSub,
        name: createDto.name,
        role: createDto.role,
      });
      expect(response.body.publicId).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      expect.assertions(1);

      const invalidDto = {
        cognitoSub: '',
        name: '',
        role: 'INVALID_ROLE',
      };

      const response = await request(app.getHttpServer()).post('/admin/api/admin-users').send(invalidDto).expect(400);

      expect(response.status).toBe(400);
    });
  });

  describe('get /admin/api/admin-users', () => {
    it('should get all admin users', async () => {
      expect.assertions(3);

      const adminUser1 = { cognitoSub: 'sub-admin1', name: 'Admin 1', role: AdminRole.VIEWER };
      const adminUser2 = { cognitoSub: 'sub-admin2', name: 'Admin 2', role: AdminRole.ADMIN };

      // Create admin users sequentially to ensure predictable order
      await request(app.getHttpServer()).post('/admin/api/admin-users').send(adminUser1).expect(201);
      await request(app.getHttpServer()).post('/admin/api/admin-users').send(adminUser2).expect(201);

      const response = await request(app.getHttpServer()).get('/admin/api/admin-users').expect(200);

      expect(response.body.adminUsers).toHaveLength(2);
      // Results are returned in createdAt desc order (newest first)
      expect(response.body.adminUsers[0].name).toBe('Admin 2');
      expect(response.body.adminUsers[1].name).toBe('Admin 1');
    });

    it('should get admin users by public IDs', async () => {
      expect.assertions(2);

      const createResponse1 = await request(app.getHttpServer())
        .post('/admin/api/admin-users')
        .send({ cognitoSub: 'sub-admin1', name: 'Admin 1', role: AdminRole.VIEWER })
        .expect(201);

      const createResponse2 = await request(app.getHttpServer())
        .post('/admin/api/admin-users')
        .send({ cognitoSub: 'sub-admin2', name: 'Admin 2', role: AdminRole.ADMIN })
        .expect(201);

      await request(app.getHttpServer())
        .post('/admin/api/admin-users')
        .send({ cognitoSub: 'sub-admin3', name: 'Admin 3', role: AdminRole.VIEWER })
        .expect(201);

      const publicIds = [createResponse1.body.publicId, createResponse2.body.publicId];
      const response = await request(app.getHttpServer())
        .get('/admin/api/admin-users')
        .query({ publicIds })
        .expect(200);

      expect(response.body.adminUsers).toHaveLength(2);
      expect(response.body.adminUsers.map((u: any) => u.publicId)).toStrictEqual(expect.arrayContaining(publicIds));
    });
  });

  describe('get /admin/api/admin-users/:publicId', () => {
    it('should get an admin user by public ID', async () => {
      expect.assertions(1);

      const createDto = {
        cognitoSub: 'sub-get',
        name: 'Get Admin',
        role: AdminRole.ADMIN,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/admin/api/admin-users')
        .send(createDto)
        .expect(201);

      const { publicId } = createResponse.body;

      const getResponse = await request(app.getHttpServer()).get(`/admin/api/admin-users/${publicId}`).expect(200);

      expect(getResponse.body).toMatchObject({
        publicId,
        cognitoSub: createDto.cognitoSub,
        name: createDto.name,
        role: createDto.role,
      });
    });

    it('should return 404 for non-existent admin user', async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer())
        .get('/admin/api/admin-users/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });
  });

  describe('put /admin/api/admin-users/:publicId', () => {
    it('should update an admin user', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'update@example.com',
        name: 'Original Name',
        role: AdminRole.VIEWER,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/admin/api/admin-users')
        .send(createDto)
        .expect(201);

      const { publicId } = createResponse.body;
      const updateDto = {
        name: 'Updated Name',
        role: AdminRole.ADMIN,
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/admin/api/admin-users/${publicId}`)
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
      expect.assertions(2);

      const response = await request(app.getHttpServer())
        .put('/admin/api/admin-users/00000000-0000-0000-0000-000000000000')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });
  });

  describe('delete /admin/api/admin-users/:publicId', () => {
    it('should delete an admin user', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'delete@example.com',
        name: 'Delete Admin',
        role: AdminRole.VIEWER,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/admin/api/admin-users')
        .send(createDto)
        .expect(201);

      const { publicId } = createResponse.body;

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/admin/api/admin-users/${publicId}`)
        .expect(204);

      const getResponse = await request(app.getHttpServer()).get(`/admin/api/admin-users/${publicId}`).expect(404);

      expect(deleteResponse.status).toBe(204);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent admin user', async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer())
        .delete('/admin/api/admin-users/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });
  });

  describe('post /admin/api/admin-users/bulk', () => {
    it('should create multiple admin users', async () => {
      expect.assertions(4);

      const createDto = {
        adminUsers: [
          { cognitoSub: 'sub-bulk1', name: 'Bulk 1', role: AdminRole.VIEWER },
          { cognitoSub: 'sub-bulk2', name: 'Bulk 2', role: AdminRole.ADMIN },
          { cognitoSub: 'sub-bulk3', name: 'Bulk 3', role: AdminRole.VIEWER },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/admin/api/admin-users/bulk')
        .send(createDto)
        .expect(201);

      expect(response.body.adminUsers).toHaveLength(3);
      expect(response.body.adminUsers[0].cognitoSub).toBe('sub-bulk1');
      expect(response.body.adminUsers[1].cognitoSub).toBe('sub-bulk2');
      expect(response.body.adminUsers[2].cognitoSub).toBe('sub-bulk3');
    });
  });

  describe('delete /admin/api/admin-users', () => {
    it('should delete multiple admin users', async () => {
      expect.assertions(2);

      const adminUsers: any[] = [];
      const createPromises = Array.from({ length: 3 }, (_, i) =>
        request(app.getHttpServer())
          .post('/admin/api/admin-users')
          .send({ cognitoSub: `sub-del-${i + 1}`, name: `Delete ${i + 1}`, role: AdminRole.VIEWER })
          .expect(201),
      );

      const responses = await Promise.all(createPromises);
      adminUsers.push(...responses.map((response) => response.body));

      const publicIdsToDelete = [adminUsers[0].publicId, adminUsers[1].publicId];

      await request(app.getHttpServer())
        .delete('/admin/api/admin-users')
        .send({ publicIds: publicIdsToDelete })
        .expect(204);

      const remainingAdminUsers = await request(app.getHttpServer()).get('/admin/api/admin-users').expect(200);

      expect(remainingAdminUsers.body.adminUsers).toHaveLength(1);
      expect(remainingAdminUsers.body.adminUsers[0].publicId).toBe(adminUsers[2].publicId);
    });
  });

  describe('apiStandardResponses error format validation', () => {
    describe('post /admin/api/admin-users', () => {
      it('should return error with statusCode and errorCode for validation errors', async () => {
        expect.assertions(3);

        const invalidDto = {
          email: 'invalid-email',
          name: '',
          role: 'INVALID_ROLE',
        };

        const response = await request(app.getHttpServer()).post('/admin/api/admin-users').send(invalidDto).expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for duplicate email', async () => {
        expect.assertions(3);

        const createDto = {
          email: 'duplicate@example.com',
          name: 'Duplicate User',
          role: AdminRole.ADMIN,
        };

        await request(app.getHttpServer()).post('/admin/api/admin-users').send(createDto).expect(201);

        const response = await request(app.getHttpServer()).post('/admin/api/admin-users').send(createDto).expect(409);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(409);
      });
    });

    describe('get /admin/api/admin-users', () => {
      it('should return error with statusCode and errorCode for invalid query params', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .get('/admin/api/admin-users?publicIds=invalid-uuid')
          .expect(500);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(500);
      });
    });

    describe('get /admin/api/admin-users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer()).get('/admin/api/admin-users/invalid-uuid').expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent admin user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .get('/admin/api/admin-users/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });
    });

    describe('put /admin/api/admin-users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .put('/admin/api/admin-users/invalid-uuid')
          .send({ name: 'Updated Name' })
          .expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent admin user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .put('/admin/api/admin-users/00000000-0000-0000-0000-000000000000')
          .send({ name: 'Updated Name' })
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });

      it('should return error with statusCode and errorCode for invalid update data', async () => {
        expect.assertions(3);

        const createDto = {
          email: 'update@example.com',
          name: 'Update User',
          role: AdminRole.VIEWER,
        };

        const createResponse = await request(app.getHttpServer())
          .post('/admin/api/admin-users')
          .send(createDto)
          .expect(201);

        const response = await request(app.getHttpServer())
          .put(`/admin/api/admin-users/${createResponse.body.publicId}`)
          .send({ role: 'INVALID_ROLE' })
          .expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });
    });

    describe('delete /admin/api/admin-users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer()).delete('/admin/api/admin-users/invalid-uuid').expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent admin user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .delete('/admin/api/admin-users/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });
    });

    describe('post /admin/api/admin-users/bulk', () => {
      it('should return error with statusCode and errorCode for invalid data', async () => {
        expect.assertions(3);

        const invalidDto = {
          adminUsers: [{ cognitoSub: '', name: '', role: 'INVALID' }],
        };

        const response = await request(app.getHttpServer())
          .post('/admin/api/admin-users/bulk')
          .send(invalidDto)
          .expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for duplicate cognitoSub', async () => {
        expect.assertions(3);

        const createDto = {
          adminUsers: [
            { cognitoSub: 'same-sub', name: 'User 1', role: AdminRole.VIEWER },
            { cognitoSub: 'same-sub', name: 'User 2', role: AdminRole.ADMIN },
          ],
        };

        const response = await request(app.getHttpServer())
          .post('/admin/api/admin-users/bulk')
          .send(createDto)
          .expect(409);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(409);
      });
    });

    describe('delete /admin/api/admin-users', () => {
      it('should return error with statusCode and errorCode for invalid UUIDs', async () => {
        expect.assertions(3);

        const deleteDto = {
          publicIds: ['invalid-uuid-1', 'invalid-uuid-2'],
        };

        const response = await request(app.getHttpServer())
          .delete('/admin/api/admin-users')
          .send(deleteDto)
          .expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });
    });
  });
});
