import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AdminRole, AdminStatus } from '@/generated/prisma';
import { createAdminApiNestApplication } from '@/tests/e2e/helpers/app-server.helper';
import { resetFirebaseAuthEmulator } from '@/tests/e2e/helpers/firebase-emulator.helper';
import { AdminUserFactory } from '@/tests/factory';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('e2e Admin API /api/admin-users', () => {
  let app: INestApplication;
  let databaseHelper: DatabaseHelper;

  const adminUserFactory = new AdminUserFactory();
  const server = () => request(app.getHttpServer());

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
    await resetFirebaseAuthEmulator();

    app = await createAdminApiNestApplication(databaseHelper);
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();
    await resetFirebaseAuthEmulator();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await databaseHelper.disconnect();
  });

  describe('get /api/admin-users', () => {
    it('should filter by publicIds', async () => {
      expect.assertions(1);

      const admin1 = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Filter Target 1' }),
      });
      await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Filter Target 2' }),
      });

      const response = await server().get('/api/admin-users').query({ publicIds: admin1.publicId }).expect(200);

      expect(response.body.adminUsers[0].publicId).toBe(admin1.publicId);
    });

    it('should return 400 for invalid uuid parameter', async () => {
      expect.assertions(2);

      const response = await server().get('/api/admin-users').query({ publicIds: 'invalid' }).expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });
  });

  describe('post /api/admin-users', () => {
    it('should create an admin user', async () => {
      expect.assertions(2);

      const response = await server()
        .post('/api/admin-users')
        .send({ cognitoSub: 'sub-admin', name: 'Admin Create', role: AdminRole.ADMIN })
        .expect(201);

      expect(response.body.name).toBe('Admin Create');

      const adminInDb = await databaseHelper.client.adminUser.findUnique({
        where: { publicId: response.body.publicId },
      });

      expect(adminInDb).not.toBeNull();
    });

    it('should return 400 when payload validation fails', async () => {
      expect.assertions(2);

      const response = await server()
        .post('/api/admin-users')
        .send({ cognitoSub: '', name: '', role: 'NOT_A_ROLE' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should return 409 on duplicate cognitoSub', async () => {
      expect.assertions(2);

      const existing = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ cognitoSub: 'duplicate-sub' }),
      });

      const response = await server()
        .post('/api/admin-users')
        .send({ cognitoSub: existing.cognitoSub, name: 'Another', role: AdminRole.ADMIN })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.errorCode).toBe('RE0003');
    });
  });

  describe('delete /api/admin-users', () => {
    it('should delete requested admin users', async () => {
      expect.assertions(2);

      const admin1 = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Delete Admin 1' }),
      });
      const admin2 = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Delete Admin 2' }),
      });
      const admin3 = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Keep Admin 3' }),
      });

      await server()
        .delete('/api/admin-users')
        .send({ publicIds: [admin1.publicId, admin2.publicId] })
        .expect(204);

      const remainingAdmins = await databaseHelper.client.adminUser.findMany();

      expect(remainingAdmins).toHaveLength(1);
      expect(remainingAdmins[0].publicId).toBe(admin3.publicId);
    });

    it('should return 400 when publicIds payload is invalid', async () => {
      expect.assertions(2);

      const response = await server()
        .delete('/api/admin-users')
        .send({ publicIds: ['not-a-uuid'] })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });
  });

  describe('post /api/admin-users/bulk', () => {
    it('should create multiple admin users', async () => {
      expect.assertions(1);

      await server()
        .post('/api/admin-users/bulk')
        .send({
          adminUsers: [
            { cognitoSub: 'bulk-sub-1', name: 'Bulk Admin 1', role: AdminRole.ADMIN },
            { cognitoSub: 'bulk-sub-2', name: 'Bulk Admin 2', role: AdminRole.VIEWER },
          ],
        })
        .expect(201);

      const count = await databaseHelper.client.adminUser.count();

      expect(count).toBe(2);
    });

    it('should return 400 when bulk payload is invalid', async () => {
      expect.assertions(2);

      const response = await server()
        .post('/api/admin-users/bulk')
        .send({ adminUsers: [{ cognitoSub: '', name: '', role: 'NOT_A_ROLE' }] })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should fail the batch on duplicate entries', async () => {
      expect.assertions(2);

      const response = await server()
        .post('/api/admin-users/bulk')
        .send({
          adminUsers: [
            { cognitoSub: 'dup-sub', name: 'Dup 1', role: AdminRole.ADMIN },
            { cognitoSub: 'dup-sub', name: 'Dup 2', role: AdminRole.ADMIN },
          ],
        })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.errorCode).toBe('RE0003');
    });
  });

  describe('crud /api/admin-users/:publicId', () => {
    it('should fetch a single admin user', async () => {
      expect.assertions(2);

      const adminUser = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Fetch Admin' }),
      });

      const response = await server().get(`/api/admin-users/${adminUser.publicId}`).expect(200);

      expect(response.body.publicId).toBe(adminUser.publicId);
      expect(response.body.name).toBe('Fetch Admin');
    });

    it('should return 404 when admin user does not exist', async () => {
      expect.assertions(2);

      const response = await server().get('/api/admin-users/11111111-1111-1111-1111-111111111111').expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });

    it('should return 400 for invalid uuid', async () => {
      expect.assertions(2);

      const response = await server().get('/api/admin-users/not-a-uuid').expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should update an admin user', async () => {
      expect.assertions(3);

      const adminUser = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Before Update', role: AdminRole.VIEWER }),
      });

      const response = await server()
        .put(`/api/admin-users/${adminUser.publicId}`)
        .send({ name: 'Updated Name', role: AdminRole.ADMIN, status: AdminStatus.SUSPENDED })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.role).toBe(AdminRole.ADMIN);

      const inDb = await databaseHelper.client.adminUser.findUnique({ where: { publicId: adminUser.publicId } });

      expect(inDb?.status).toBe(AdminStatus.SUSPENDED);
    });

    it('should validate update payload', async () => {
      expect.assertions(2);

      const adminUser = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Invalid Update' }),
      });

      const response = await server()
        .put(`/api/admin-users/${adminUser.publicId}`)
        .send({ role: 'invalid-role' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should return 404 when updating a non-existent admin user', async () => {
      expect.assertions(2);

      const response = await server()
        .put('/api/admin-users/11111111-1111-1111-1111-111111111111')
        .send({ name: 'Missing User' })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });

    it('should return 400 for invalid uuid on update', async () => {
      expect.assertions(2);

      const response = await server().put('/api/admin-users/not-a-uuid').send({ name: 'Invalid' }).expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });

    it('should delete an admin user', async () => {
      expect.assertions(1);

      const adminUser = await databaseHelper.client.adminUser.create({
        data: adminUserFactory.build({ name: 'Delete Me' }),
      });

      await server().delete(`/api/admin-users/${adminUser.publicId}`).expect(204);

      const inDb = await databaseHelper.client.adminUser.findUnique({ where: { publicId: adminUser.publicId } });

      expect(inDb).toBeNull();
    });

    it('should return 404 when deleting a non-existent admin user', async () => {
      expect.assertions(2);

      const response = await server()
        .delete('/api/admin-users/22222222-2222-2222-2222-222222222222')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });

    it('should return 400 for invalid uuid on delete', async () => {
      expect.assertions(2);

      const response = await server().delete('/api/admin-users/not-a-uuid').expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.errorCode).toBe('AP0400');
    });
  });
});
