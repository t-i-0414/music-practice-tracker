import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppApiUsersController } from '@/apis/app/users/users.controller';
import { GlobalExceptionFilter } from '@/apis/utils/filters/global-exception.filter';
import { UserAuthGuard } from '@/apis/utils/guards/user-auth.guard';
import { FirebaseAuthModule } from '@/domain/aggregates/firebase-auth/firebase-auth.module';
import { UserModule } from '@/domain/aggregates/user/user.module';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('e2e AppApiUsersController', () => {
  let app: INestApplication;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, FirebaseAuthModule],
      controllers: [AppApiUsersController],
      providers: [
        { provide: APP_FILTER, useClass: GlobalExceptionFilter },
        { provide: RepositoryService, useValue: databaseHelper.client },
      ],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
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

  describe('post /users', () => {
    it('should create a new user', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer()).post('/api/users').send(createDto).expect(201);

      expect(response.body).toMatchObject({
        email: createDto.email,
        name: createDto.name,
      });
      expect(response.body.publicId).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      expect.assertions(1);

      const invalidDto = {
        email: 'invalid-email',
        name: '',
      };

      const response = await request(app.getHttpServer()).post('/api/users').send(invalidDto).expect(400);

      expect(response.status).toBe(400);
    });
  });

  describe('get /users/:publicId', () => {
    it('should get a user by public ID', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'get@example.com',
        name: 'Get User',
      };

      const createResponse = await request(app.getHttpServer()).post('/api/users').send(createDto).expect(201);

      const { publicId } = createResponse.body;

      const getResponse = await request(app.getHttpServer()).get(`/api/users/${publicId}`).expect(200);

      expect(getResponse.body).toMatchObject({
        publicId,
        email: createDto.email,
        name: createDto.name,
      });
    });

    it('should return 404 for non-existent user', async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer())
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.status).toBe(404);
      expect(response.body.errorCode).toBe('RE0002');
    });
  });

  describe('apiStandardResponses error format validation', () => {
    describe('post /users', () => {
      it('should return error with statusCode and errorCode for validation errors', async () => {
        expect.assertions(3);

        const invalidDto = {
          email: 'invalid-email',
          name: '',
        };

        const response = await request(app.getHttpServer()).post('/api/users').send(invalidDto).expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for duplicate email', async () => {
        expect.assertions(3);

        const createDto = {
          email: 'duplicate@example.com',
          name: 'Duplicate User',
        };

        await request(app.getHttpServer()).post('/api/users').send(createDto).expect(201);

        const response = await request(app.getHttpServer()).post('/api/users').send(createDto).expect(409);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(409);
      });
    });

    describe('get /users/:publicId', () => {
      it('should return error with statusCode and errorCode for invalid UUID', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer()).get('/api/users/invalid-uuid').expect(400);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(400);
      });

      it('should return error with statusCode and errorCode for non-existent user', async () => {
        expect.assertions(3);

        const response = await request(app.getHttpServer())
          .get('/api/users/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('errorCode');
        expect(response.body.statusCode).toBe(404);
      });
    });
  });
});
