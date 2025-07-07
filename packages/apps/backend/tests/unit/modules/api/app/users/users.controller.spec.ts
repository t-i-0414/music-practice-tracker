import type { Server } from 'http';

import { HttpStatus, NotFoundException, type INestApplication } from '@nestjs/common';
import { type TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import {
  activeUserFixture,
  activeUserJsonFixture,
  createHttpTester,
  createMockUserAppFacadeService,
  createTestModule,
  createUserInputFixture,
  expectBadRequestError,
  expectInternalServerError,
  expectJsonResponse,
  expectNoContentResponse,
  expectNotFoundError,
  expectUuidValidationError,
  setupIntegrationTest,
  setupNoLoggerTestApp,
  setupTestApp,
  testConcurrentRequests,
  updateUserEmailInputFixture,
  updateUserInputFixture,
  USER_FIXTURE_IDS,
} from '../../../../helpers';

import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import type { CreateUserInputDto, UpdateUserDataDto } from '@/modules/aggregate/user/user.input.dto';
import { AppUsersController } from '@/modules/api/app/users/users.controller';

describe('AppUsersController', () => {
  const { setApp } = setupIntegrationTest();

  let app: INestApplication;
  let noLoggerApp: INestApplication;
  let controller: AppUsersController;
  let facadeService: jest.Mocked<UserAppFacadeService>;
  let httpTester: ReturnType<typeof createHttpTester>;
  let noLoggerHttpTester: ReturnType<typeof createHttpTester>;

  beforeEach(async () => {
    const mockFacadeService = createMockUserAppFacadeService();

    const module: TestingModule = await createTestModule({
      controllers: [AppUsersController],
      providers: [
        {
          provide: UserAppFacadeService,
          useValue: mockFacadeService,
        },
      ],
    });

    app = await setupTestApp(module);
    noLoggerApp = await setupNoLoggerTestApp(module);
    setApp(app);
    setApp(noLoggerApp);
    httpTester = createHttpTester(app);
    noLoggerHttpTester = createHttpTester(noLoggerApp);
    controller = module.get<AppUsersController>(AppUsersController);
    facadeService = module.get(UserAppFacadeService);
  });

  describe('Controller setup', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have UserAppFacadeService injected', () => {
      expect(facadeService).toBeDefined();
    });

    it('should have the correct route prefix', () => {
      const path = Reflect.getMetadata('path', AppUsersController);
      expect(path).toBe('api/users');
    });
  });

  describe('GET /api/users/:id', () => {
    const validUUID = USER_FIXTURE_IDS.ACTIVE;

    it('should return user by ID', async () => {
      facadeService.findUserById.mockResolvedValue(activeUserFixture);

      await expectJsonResponse(httpTester.get(`/api/users/${validUUID}`), activeUserJsonFixture);

      expect(facadeService.findUserById).toHaveBeenCalledWith({ id: validUUID });
      expect(facadeService.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should validate UUID format', async () => {
      await expectUuidValidationError(httpTester.get(`/api/users/${USER_FIXTURE_IDS.INVALID}`));

      expect(facadeService.findUserById).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      facadeService.findUserById.mockRejectedValue(new NotFoundException('User not found'));

      await expectNotFoundError(httpTester.get(`/api/users/${validUUID}`), 'User not found');
    });

    it('should handle special characters in UUIDs', async () => {
      const upperCaseUUID = '123E4567-E89B-12D3-A456-426614174000';
      facadeService.findUserById.mockResolvedValue(activeUserFixture);

      await expectJsonResponse(httpTester.get(`/api/users/${upperCaseUUID}`), activeUserJsonFixture);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      facadeService.createUser.mockResolvedValue(activeUserFixture);

      await expectJsonResponse(
        httpTester.post('/api/users').send(createUserInputFixture),
        activeUserJsonFixture,
        HttpStatus.CREATED,
      );

      expect(facadeService.createUser).toHaveBeenCalledWith(createUserInputFixture);
      expect(facadeService.createUser).toHaveBeenCalledTimes(1);
    });

    it('should validate request body', async () => {
      const invalidDto = {
        email: 'invalid-email',
      };

      await expectBadRequestError(httpTester.post('/api/users').send(invalidDto));

      expect(facadeService.createUser).not.toHaveBeenCalled();
    });

    it('should handle duplicate email error', async () => {
      const createDto: CreateUserInputDto = {
        name: 'New User',
        email: 'existing@example.com',
      };

      facadeService.createUser.mockRejectedValue(new Error('Email already exists'));

      await expectInternalServerError(noLoggerHttpTester.post('/api/users').send(createDto));
    });

    it('should handle empty body', async () => {
      await expectBadRequestError(httpTester.post('/api/users').send({}));

      expect(facadeService.createUser).not.toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      const incompleteDto = {
        name: 'User Without Email',
      };

      await expectBadRequestError(httpTester.post('/api/users').send(incompleteDto));

      expect(facadeService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/users/:id', () => {
    const validUUID = USER_FIXTURE_IDS.ACTIVE;

    it('should update a user', async () => {
      const updatedUser = { ...activeUserFixture, name: updateUserInputFixture.name };
      const updatedUserJson = {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      };
      facadeService.updateUserById.mockResolvedValue(updatedUser);

      await expectJsonResponse(httpTester.put(`/api/users/${validUUID}`).send(updateUserInputFixture), updatedUserJson);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: updateUserInputFixture,
      });
    });

    it('should validate UUID format', async () => {
      await expectUuidValidationError(
        httpTester.put(`/api/users/${USER_FIXTURE_IDS.INVALID}`).send({ name: 'Updated' }),
      );

      expect(facadeService.updateUserById).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      facadeService.updateUserById.mockResolvedValue(activeUserFixture);

      await expectJsonResponse(
        httpTester.put(`/api/users/${validUUID}`).send(updateUserEmailInputFixture),
        activeUserJsonFixture,
      );

      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: updateUserEmailInputFixture,
      });
    });

    it('should handle user not found', async () => {
      facadeService.updateUserById.mockRejectedValue(new NotFoundException('User not found'));

      await expectNotFoundError(httpTester.put(`/api/users/${validUUID}`).send({ name: 'Updated' }), 'User not found');
    });

    it('should handle empty update data', async () => {
      facadeService.updateUserById.mockResolvedValue(activeUserFixture);

      await expectJsonResponse(httpTester.put(`/api/users/${validUUID}`).send({}), activeUserJsonFixture);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: {},
      });
    });

    it('should handle all fields update', async () => {
      const fullUpdate: UpdateUserDataDto = {
        name: 'Completely Updated User',
        email: 'completely.new@example.com',
      };

      facadeService.updateUserById.mockResolvedValue(activeUserFixture);

      await expectJsonResponse(httpTester.put(`/api/users/${validUUID}`).send(fullUpdate), activeUserJsonFixture);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: fullUpdate,
      });
    });
  });

  describe('DELETE /api/users/:id', () => {
    const validUUID = USER_FIXTURE_IDS.ACTIVE;

    it('should soft delete a user', async () => {
      facadeService.deleteUserById.mockResolvedValue(undefined);

      await expectNoContentResponse(httpTester.delete(`/api/users/${validUUID}`));

      expect(facadeService.deleteUserById).toHaveBeenCalledWith({ id: validUUID });
      expect(facadeService.deleteUserById).toHaveBeenCalledTimes(1);
    });

    it('should return no content even if user not found', async () => {
      facadeService.deleteUserById.mockResolvedValue(undefined);

      await expectNoContentResponse(httpTester.delete(`/api/users/${validUUID}`));
    });

    it('should validate UUID format', async () => {
      await expectUuidValidationError(httpTester.delete(`/api/users/${USER_FIXTURE_IDS.INVALID}`));

      expect(facadeService.deleteUserById).not.toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      facadeService.deleteUserById.mockRejectedValue(new Error('Database error'));

      await expectInternalServerError(httpTester.delete(`/api/users/${validUUID}`));
    });
  });

  describe('Controller method delegation', () => {
    it('should delegate all methods correctly', async () => {
      facadeService.findUserById.mockResolvedValue(activeUserFixture);
      facadeService.createUser.mockResolvedValue(activeUserFixture);
      facadeService.updateUserById.mockResolvedValue(activeUserFixture);
      facadeService.deleteUserById.mockResolvedValue(undefined);

      const id = '123e4567-e89b-12d3-a456-426614174000';
      const createDto: CreateUserInputDto = { name: 'Test', email: 'test@example.com' };
      const updateDto: UpdateUserDataDto = { name: 'Updated' };

      await controller.findUserById(id);
      expect(facadeService.findUserById).toHaveBeenCalledWith({ id });

      await controller.createUser(createDto);
      expect(facadeService.createUser).toHaveBeenCalledWith(createDto);

      await controller.updateUser(id, updateDto);
      expect(facadeService.updateUserById).toHaveBeenCalledWith({ id, data: updateDto });

      await controller.deleteUser(id);
      expect(facadeService.deleteUserById).toHaveBeenCalledWith({ id });
    });
  });

  describe('Error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom error');
      customError.stack = 'Original stack';
      facadeService.createUser.mockRejectedValue(customError);

      await expectInternalServerError(httpTester.post('/api/users').send({ name: 'Test', email: 'test@example.com' }));
    });

    it('should handle validation pipe errors', async () => {
      await expectUuidValidationError(httpTester.get('/api/users/not-a-uuid'));
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrent requests', async () => {
      facadeService.createUser.mockResolvedValue(activeUserFixture);

      await testConcurrentRequests(
        (i) => httpTester.post('/api/users').send({ name: `User ${i}`, email: `user${i}@example.com` }),
        3,
        HttpStatus.CREATED,
      );

      expect(facadeService.createUser).toHaveBeenCalledTimes(3);
    });

    it('should handle very long input values', async () => {
      const longName = 'a'.repeat(1000);
      const createDto: CreateUserInputDto = {
        name: longName,
        email: 'long@example.com',
      };

      await request(app.getHttpServer() as Server)
        .post('/api/users')
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('Response structure', () => {
    it('should return proper JSON response for user', async () => {
      facadeService.findUserById.mockResolvedValue(activeUserFixture);

      const response = await request(app.getHttpServer() as Server)
        .get(`/api/users/${activeUserFixture.id}`)
        .expect('Content-Type', /json/u)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).not.toHaveProperty('deletedAt');
    });

    it('should return empty body for NO_CONTENT responses', async () => {
      facadeService.deleteUserById.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer() as Server)
        .delete(`/api/users/${activeUserFixture.id}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(response.body).toEqual({});
    });
  });

  describe('Security considerations', () => {
    it('should not expose internal error details', async () => {
      const sensitiveError = new Error('Database connection failed at 192.168.1.1');
      facadeService.findUserById.mockRejectedValue(sensitiveError);

      const response = await request(app.getHttpServer() as Server)
        .get(`/api/users/${activeUserFixture.id}`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body.message).toBe('Internal server error');
      expect(response.body.message).not.toContain('192.168.1.1');
    });

    it('should handle malformed JSON gracefully', async () => {
      await request(app.getHttpServer() as Server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{"invalid json')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
