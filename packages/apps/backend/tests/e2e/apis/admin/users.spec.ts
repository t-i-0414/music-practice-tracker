import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AdminApiModule } from '@/apis/admin/admin.module';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('admin Users API (e2e)', () => {
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

  describe('gET /admin/users', () => {
    it('should get all users', async () => {
      expect.assertions(3);

      const users = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
      ];

      await Promise.all(users.map((user) => request(app.getHttpServer()).post('/admin/users').send(user).expect(201)));

      const response = await request(app.getHttpServer()).get('/admin/users').expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.users[0].email).toBe('user1@example.com');
      expect(response.body.users[1].email).toBe('user2@example.com');
    });

    it('should get users by public IDs', async () => {
      expect.assertions(2);

      const createResponse1 = await request(app.getHttpServer())
        .post('/admin/users')
        .send({ email: 'user1@example.com', name: 'User 1' })
        .expect(201);

      const createResponse2 = await request(app.getHttpServer())
        .post('/admin/users')
        .send({ email: 'user2@example.com', name: 'User 2' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/admin/users')
        .send({ email: 'user3@example.com', name: 'User 3' })
        .expect(201);

      const publicIds = [createResponse1.body.publicId, createResponse2.body.publicId];
      const response = await request(app.getHttpServer()).get('/admin/users').query({ publicIds }).expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.users.map((u: any) => u.publicId)).toStrictEqual(expect.arrayContaining(publicIds));
    });
  });

  describe('pOST /admin/users/bulk', () => {
    it('should create multiple users', async () => {
      expect.assertions(4);

      const createDto = {
        users: [
          { email: 'bulk1@example.com', name: 'Bulk 1' },
          { email: 'bulk2@example.com', name: 'Bulk 2' },
          { email: 'bulk3@example.com', name: 'Bulk 3' },
        ],
      };

      const response = await request(app.getHttpServer()).post('/admin/users/bulk').send(createDto).expect(201);

      expect(response.body.users).toHaveLength(3);
      expect(response.body.users[0].email).toBe('bulk1@example.com');
      expect(response.body.users[1].email).toBe('bulk2@example.com');
      expect(response.body.users[2].email).toBe('bulk3@example.com');
    });
  });

  describe('dELETE /admin/users', () => {
    it('should delete multiple users', async () => {
      expect.assertions(2);

      const users: any[] = [];
      const createPromises = Array.from({ length: 3 }, (_, i) =>
        request(app.getHttpServer())
          .post('/admin/users')
          .send({ email: `del${i + 1}@example.com`, name: `Delete ${i + 1}` })
          .expect(201),
      );

      const responses = await Promise.all(createPromises);
      users.push(...responses.map((response) => response.body));

      const publicIdsToDelete = [users[0].publicId, users[1].publicId];

      await request(app.getHttpServer()).delete('/admin/users').send({ publicIds: publicIdsToDelete }).expect(204);

      const remainingUsers = await request(app.getHttpServer()).get('/admin/users').expect(200);

      expect(remainingUsers.body.users).toHaveLength(1);
      expect(remainingUsers.body.users[0].publicId).toBe(users[2].publicId);
    });
  });
});
