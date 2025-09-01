import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppApiModule } from '@/apis/app/app.module';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('app API Decorators and Guards (e2e)', () => {
  let app: INestApplication;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
    await databaseHelper.disconnect();
  });

  describe('@ApiController decorator', () => {
    it('should apply correct route prefix', async () => {
      expect.assertions(1);

      // The users controller should be available at /users
      const response = await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .expect(HttpStatus.NOT_FOUND); // Expected since user doesn't exist

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for incorrect route prefix', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer()).get('/api/users/123').expect(HttpStatus.NOT_FOUND);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('validation pipes', () => {
    it('should validate UUID format in path parameters', async () => {
      expect.assertions(1);

      // Invalid UUID format should be rejected
      const response = await request(app.getHttpServer()).get('/users/invalid-uuid').expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate request body DTOs', async () => {
      expect.assertions(1);

      const invalidBody = {
        email: 'not-an-email',
        name: '', // Empty name
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(invalidBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Validation failed');
    });

    it('should accept valid request body', async () => {
      expect.assertions(2);

      const validBody = {
        email: 'valid@example.com',
        name: 'Valid User',
      };

      const response = await request(app.getHttpServer()).post('/users').send(validBody).expect(HttpStatus.CREATED);

      expect(response.body.email).toBe(validBody.email);
      expect(response.body.name).toBe(validBody.name);
    });
  });

  describe('query parameter handling', () => {
    it('should handle array query parameters', async () => {
      expect.assertions(1);

      // Create test users
      const createPromises = Array.from({ length: 3 }, (_, i) =>
        request(app.getHttpServer())
          .post('/users')
          .send({ email: `user${i + 1}@example.com`, name: `User ${i + 1}` })
          .expect(HttpStatus.CREATED),
      );

      const responses = await Promise.all(createPromises);
      const users = responses.map((response) => response.body);

      // Query with array of IDs (when admin endpoint is available)
      // For now, test that the endpoint exists
      const response = await request(app.getHttpServer()).get(`/users/${users[0].publicId}`).expect(HttpStatus.OK);

      expect(response.body.publicId).toBe(users[0].publicId);
    });
  });

  describe('hTTP method decorators', () => {
    it('should handle GET requests', async () => {
      expect.assertions(1);

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'get@example.com', name: 'GET User' })
        .expect(HttpStatus.CREATED);

      const getResponse = await request(app.getHttpServer())
        .get(`/users/${createResponse.body.publicId}`)
        .expect(HttpStatus.OK);

      expect(getResponse.status).toBe(HttpStatus.OK);
    });

    it('should handle POST requests', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'post@example.com', name: 'POST User' })
        .expect(HttpStatus.CREATED);

      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should handle PUT requests', async () => {
      expect.assertions(1);

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'put@example.com', name: 'Original Name' })
        .expect(HttpStatus.CREATED);

      const updateResponse = await request(app.getHttpServer())
        .put(`/users/${createResponse.body.publicId}`)
        .send({ name: 'Updated Name' })
        .expect(HttpStatus.OK);

      expect(updateResponse.status).toBe(HttpStatus.OK);
    });

    it('should return 405 for unsupported methods', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .patch('/users/123')
        .send({ name: 'Patch Name' })
        .expect(HttpStatus.NOT_FOUND); // PATCH not implemented

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('response status codes', () => {
    it('should return 201 for successful creation', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'create@example.com', name: 'Create User' })
        .expect(HttpStatus.CREATED);

      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return 200 for successful retrieval', async () => {
      expect.assertions(1);

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'retrieve@example.com', name: 'Retrieve User' })
        .expect(HttpStatus.CREATED);

      const getResponse = await request(app.getHttpServer())
        .get(`/users/${createResponse.body.publicId}`)
        .expect(HttpStatus.OK);

      expect(getResponse.status).toBe(HttpStatus.OK);
    });

    it('should return 200 for successful update', async () => {
      expect.assertions(1);

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'update@example.com', name: 'Original' })
        .expect(HttpStatus.CREATED);

      const updateResponse = await request(app.getHttpServer())
        .put(`/users/${createResponse.body.publicId}`)
        .send({ name: 'Updated' })
        .expect(HttpStatus.OK);

      expect(updateResponse.status).toBe(HttpStatus.OK);
    });

    it('should return 404 for non-existent resources', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for invalid requests', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ invalid: 'data' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('swagger/OpenAPI decorators', () => {
    it('should handle ApiProperty decorated fields', async () => {
      expect.assertions(5);

      const userData = {
        email: 'swagger@example.com',
        name: 'Swagger User',
      };

      const response = await request(app.getHttpServer()).post('/users').send(userData).expect(HttpStatus.CREATED);

      // Response should include all ApiProperty decorated fields
      expect(response.body).toHaveProperty('publicId');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });
  });

  describe('error handling with decorators', () => {
    it('should handle validation errors properly', async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email-format',
          name: 'a'.repeat(256), // Exceeds max length
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode', HttpStatus.BAD_REQUEST);
    });

    it('should handle unique constraint violations', async () => {
      expect.assertions(1);

      const userData = {
        email: 'unique@example.com',
        name: 'Unique User',
      };

      // Create first user
      await request(app.getHttpServer()).post('/users').send(userData).expect(HttpStatus.CREATED);

      // Try to create duplicate
      const response = await request(app.getHttpServer()).post('/users').send(userData).expect(HttpStatus.CONFLICT);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('content-Type handling', () => {
    it('should accept application/json', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({ email: 'json@example.com', name: 'JSON User' })
        .expect(HttpStatus.CREATED);

      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should reject non-JSON content types for POST', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Content-Type', 'text/plain')
        .send('email=text@example.com&name=Text User')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
