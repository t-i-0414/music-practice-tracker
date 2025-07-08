import { HttpStatus, NotFoundException, type INestApplication } from '@nestjs/common';
import { type TestingModule } from '@nestjs/testing';

import {
  activeUserFixture,
  activeUserJsonFixture,
  activeUsersResponseFixture,
  activeUsersResponseJsonFixture,
  anyUserFixture,
  anyUserJsonFixture,
  anyUsersResponseFixture,
  anyUsersResponseJsonFixture,
  createHttpTester,
  createMockUserAdminFacadeService,
  createTestModule,
  createUserInputFixture,
  deletedUserFixture,
  deletedUserJsonFixture,
  deletedUsersResponseFixture,
  deletedUsersResponseJsonFixture,
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
  testUserIdsFixture,
  updateUserInputFixture,
  USER_FIXTURE_IDS,
} from '../../../../helpers';

import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import type {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  HardDeleteManyUsersInputDto,
  RestoreManyUsersInputDto,
  UpdateUserDataDto,
} from '@/modules/aggregate/user/user.input.dto';
import { AdminUsersController } from '@/modules/api/admin/users/users.controller';

describe('AdminUsersController', () => {
  const { setApp } = setupIntegrationTest();

  let app: INestApplication;
  let noLoggerApp: INestApplication;
  let controller: AdminUsersController;
  let facadeService: jest.Mocked<UserAdminFacadeService>;
  let httpTester: ReturnType<typeof createHttpTester>;
  let noLoggerHttpTester: ReturnType<typeof createHttpTester>;

  beforeEach(async () => {
    const mockFacadeService = createMockUserAdminFacadeService();

    const module: TestingModule = await createTestModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: UserAdminFacadeService,
          useValue: mockFacadeService,
        },
      ],
    });

    app = await setupTestApp(module);
    setApp(app);
    noLoggerApp = await setupNoLoggerTestApp(module);
    httpTester = createHttpTester(app);
    noLoggerHttpTester = createHttpTester(noLoggerApp);
    controller = module.get<AdminUsersController>(AdminUsersController);
    facadeService = module.get(UserAdminFacadeService);
  });

  describe('Controller setup', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have UserAdminFacadeService injected', () => {
      expect(facadeService).toBeDefined();
    });

    it('should have the correct route prefix', () => {
      const path = Reflect.getMetadata('path', AdminUsersController);
      expect(path).toBe('api/users');
    });
  });

  describe('GET /api/users/active_users', () => {
    it('should return active users by IDs', async () => {
      const ids = ['id1', 'id2'];
      facadeService.findManyUsers.mockResolvedValue(activeUsersResponseFixture);

      await expectJsonResponse(
        httpTester.get('/api/users/active_users').query({ ids }),
        activeUsersResponseJsonFixture,
      );

      expect(facadeService.findManyUsers).toHaveBeenCalledWith({ ids });
      expect(facadeService.findManyUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle empty ids array', async () => {
      facadeService.findManyUsers.mockResolvedValue({ users: [] });

      await expectJsonResponse(httpTester.get('/api/users/active_users').query({ ids: [] }), { users: [] });
    });

    it('should handle single id in query', async () => {
      facadeService.findManyUsers.mockResolvedValue(activeUsersResponseFixture);

      await expectJsonResponse(
        httpTester.get('/api/users/active_users').query({ ids: 'single-id' }),
        activeUsersResponseJsonFixture,
      );

      expect(facadeService.findManyUsers).toHaveBeenCalledWith({ ids: ['single-id'] });
    });

    it('should handle service errors', async () => {
      facadeService.findManyUsers.mockRejectedValue(new NotFoundException('Users not found'));

      await expectNotFoundError(
        httpTester.get('/api/users/active_users').query({ ids: ['non-existent'] }),
        'Users not found',
      );
    });
  });

  describe('GET /api/users/active_users/:id', () => {
    const validUUID = USER_FIXTURE_IDS.ACTIVE;

    it('should return active user by ID', async () => {
      facadeService.findUserById.mockResolvedValue(activeUserFixture);

      await expectJsonResponse(httpTester.get(`/api/users/active_users/${validUUID}`), activeUserJsonFixture);

      expect(facadeService.findUserById).toHaveBeenCalledWith({ id: validUUID });
      expect(facadeService.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should validate UUID format', async () => {
      await expectUuidValidationError(httpTester.get(`/api/users/active_users/${USER_FIXTURE_IDS.INVALID}`));

      expect(facadeService.findUserById).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      facadeService.findUserById.mockRejectedValue(new NotFoundException('User not found'));

      await expectNotFoundError(httpTester.get(`/api/users/active_users/${validUUID}`), 'User not found');
    });
  });

  describe('GET /api/users/deleted_users', () => {
    it('should return deleted users by IDs', async () => {
      const ids = ['id1', 'id2'];
      facadeService.findManyDeletedUsers.mockResolvedValue(deletedUsersResponseFixture);

      const response = await httpTester.get('/api/users/deleted_users').query({ ids }).expect(HttpStatus.OK);

      expect(response.body).toEqual(deletedUsersResponseJsonFixture);
      expect(facadeService.findManyDeletedUsers).toHaveBeenCalledWith({ ids });
      expect(facadeService.findManyDeletedUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/users/deleted_users/:id', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should return deleted user by ID', async () => {
      facadeService.findDeletedUserById.mockResolvedValue(deletedUserFixture);

      const response = await httpTester.get(`/api/users/deleted_users/${validUUID}`).expect(HttpStatus.OK);

      expect(response.body).toEqual(deletedUserJsonFixture);
      expect(facadeService.findDeletedUserById).toHaveBeenCalledWith({ id: validUUID });
    });

    it('should have deletedAt field in response', async () => {
      facadeService.findDeletedUserById.mockResolvedValue(deletedUserFixture);

      const response = await httpTester.get(`/api/users/deleted_users/${validUUID}`).expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('deletedAt');
      expect(new Date(response.body.deletedAt as string)).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/users/any_users', () => {
    it('should return any users by IDs', async () => {
      const ids = ['id1', 'id2'];
      facadeService.findManyAnyUsers.mockResolvedValue(anyUsersResponseFixture);

      const response = await httpTester.get('/api/users/any_users').query({ ids }).expect(HttpStatus.OK);

      expect(response.body).toEqual(anyUsersResponseJsonFixture);
      expect(facadeService.findManyAnyUsers).toHaveBeenCalledWith({ ids });
    });
  });

  describe('GET /api/users/any_users/:id', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should return any user by ID', async () => {
      facadeService.findAnyUserById.mockResolvedValue(anyUserFixture);

      const response = await httpTester.get(`/api/users/any_users/${validUUID}`).expect(HttpStatus.OK);

      expect(response.body).toEqual(anyUserJsonFixture);
      expect(facadeService.findAnyUserById).toHaveBeenCalledWith({ id: validUUID });
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
  });

  describe('POST /api/users/bulk', () => {
    it('should create multiple users', async () => {
      const createManyDto: CreateManyUsersInputDto = {
        users: [
          { name: 'User 1', email: 'user1@example.com' },
          { name: 'User 2', email: 'user2@example.com' },
        ],
      };

      facadeService.createManyAndReturnUsers.mockResolvedValue(activeUsersResponseFixture);

      const response = await httpTester.post('/api/users/bulk').send(createManyDto).expect(HttpStatus.CREATED);

      expect(response.body).toEqual(activeUsersResponseJsonFixture);
      expect(facadeService.createManyAndReturnUsers).toHaveBeenCalledWith(createManyDto);
    });

    it('should handle empty users array', async () => {
      const emptyDto: CreateManyUsersInputDto = {
        users: [],
      };

      await httpTester.post('/api/users/bulk').send(emptyDto).expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.createManyAndReturnUsers).not.toHaveBeenCalled();
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
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateUserDataDto = {
        email: 'newemail@example.com',
      };

      facadeService.updateUserById.mockResolvedValue(activeUserFixture);

      await httpTester.put(`/api/users/${validUUID}`).send(partialUpdate).expect(HttpStatus.OK);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({
        id: validUUID,
        data: partialUpdate,
      });
    });

    it('should handle user not found', async () => {
      facadeService.updateUserById.mockRejectedValue(new NotFoundException('User not found'));

      await httpTester.put(`/api/users/${validUUID}`).send({ name: 'Updated' }).expect(HttpStatus.NOT_FOUND);
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

      await httpTester.delete(`/api/users/${validUUID}`).expect(HttpStatus.NO_CONTENT);
    });

    it('should validate UUID format', async () => {
      await expectUuidValidationError(httpTester.delete(`/api/users/${USER_FIXTURE_IDS.INVALID}`));

      expect(facadeService.deleteUserById).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/users/bulk', () => {
    it('should soft delete multiple users', async () => {
      const deleteDto: DeleteManyUsersInputDto = {
        ids: testUserIdsFixture,
      };

      facadeService.deleteManyUsersById.mockResolvedValue(undefined);

      await expectNoContentResponse(httpTester.delete('/api/users/bulk').send(deleteDto));

      expect(facadeService.deleteManyUsersById).toHaveBeenCalledWith(deleteDto);
    });

    it('should handle empty ids array', async () => {
      const emptyDto: DeleteManyUsersInputDto = {
        ids: [],
      };

      await httpTester.delete('/api/users/bulk').send(emptyDto).expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.deleteManyUsersById).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/users/hard/:id', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should hard delete a user', async () => {
      facadeService.hardDeleteUserById.mockResolvedValue(undefined);

      await httpTester.delete(`/api/users/hard/${validUUID}`).expect(HttpStatus.NO_CONTENT);

      expect(facadeService.hardDeleteUserById).toHaveBeenCalledWith({ id: validUUID });
      expect(facadeService.hardDeleteUserById).toHaveBeenCalledTimes(1);
    });

    it('should validate UUID format', async () => {
      await httpTester.delete('/api/users/hard/invalid-uuid').expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.hardDeleteUserById).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/users/hard/bulk', () => {
    it('should hard delete multiple users', async () => {
      const hardDeleteDto: HardDeleteManyUsersInputDto = {
        ids: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
      };

      facadeService.hardDeleteManyUsersById.mockResolvedValue(undefined);

      const response = await httpTester.delete('/api/users/hard/bulk').send(hardDeleteDto);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      expect(facadeService.hardDeleteManyUsersById).toHaveBeenCalledWith(hardDeleteDto);
    });
  });

  describe('PUT /api/users/:id/restore', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should restore a soft-deleted user', async () => {
      facadeService.restoreUserById.mockResolvedValue(activeUserFixture);

      const response = await httpTester.put(`/api/users/${validUUID}/restore`).expect(HttpStatus.OK);

      expect(response.body).toEqual(activeUserJsonFixture);
      expect(facadeService.restoreUserById).toHaveBeenCalledWith({ id: validUUID });
    });

    it('should validate UUID format', async () => {
      await httpTester.put('/api/users/invalid-uuid/restore').expect(HttpStatus.BAD_REQUEST);
    });

    it('should handle user not found', async () => {
      facadeService.restoreUserById.mockRejectedValue(new NotFoundException('User not found'));

      await httpTester.put(`/api/users/${validUUID}/restore`).expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT /api/users/restore/bulk', () => {
    it('should restore multiple soft-deleted users', async () => {
      const restoreDto: RestoreManyUsersInputDto = {
        ids: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
      };

      facadeService.restoreManyUsersById.mockResolvedValue(activeUsersResponseFixture);

      const response = await httpTester.put('/api/users/restore/bulk').send(restoreDto).expect(HttpStatus.OK);

      expect(response.body).toEqual(activeUsersResponseJsonFixture);
      expect(facadeService.restoreManyUsersById).toHaveBeenCalledWith(restoreDto);
    });

    it('should handle empty ids array', async () => {
      const emptyDto: RestoreManyUsersInputDto = {
        ids: [],
      };

      await httpTester.put('/api/users/restore/bulk').send(emptyDto).expect(HttpStatus.BAD_REQUEST);

      expect(facadeService.restoreManyUsersById).not.toHaveBeenCalled();
    });
  });

  describe('Controller method delegation', () => {
    it('should delegate all query methods correctly', async () => {
      facadeService.findUserById.mockResolvedValue(activeUserFixture);
      facadeService.findDeletedUserById.mockResolvedValue(deletedUserFixture);
      facadeService.findAnyUserById.mockResolvedValue(anyUserFixture);
      facadeService.findManyUsers.mockResolvedValue(activeUsersResponseFixture);
      facadeService.findManyDeletedUsers.mockResolvedValue(deletedUsersResponseFixture);
      facadeService.findManyAnyUsers.mockResolvedValue(anyUsersResponseFixture);

      const id = '123e4567-e89b-12d3-a456-426614174000';
      const ids = ['id1', 'id2'];

      await controller.findUserById(id);
      expect(facadeService.findUserById).toHaveBeenCalledWith({ id });

      await controller.findDeletedUserById(id);
      expect(facadeService.findDeletedUserById).toHaveBeenCalledWith({ id });

      await controller.findAnyUserById(id);
      expect(facadeService.findAnyUserById).toHaveBeenCalledWith({ id });

      await controller.findManyUsers(ids);
      expect(facadeService.findManyUsers).toHaveBeenCalledWith({ ids });

      await controller.findManyDeletedUsers(ids);
      expect(facadeService.findManyDeletedUsers).toHaveBeenCalledWith({ ids });

      await controller.findManyAnyUsers(ids);
      expect(facadeService.findManyAnyUsers).toHaveBeenCalledWith({ ids });
    });

    it('should delegate all command methods correctly', async () => {
      facadeService.createUser.mockResolvedValue(activeUserFixture);
      facadeService.createManyAndReturnUsers.mockResolvedValue(activeUsersResponseFixture);
      facadeService.updateUserById.mockResolvedValue(activeUserFixture);
      facadeService.deleteUserById.mockResolvedValue(undefined);
      facadeService.deleteManyUsersById.mockResolvedValue(undefined);
      facadeService.hardDeleteUserById.mockResolvedValue(undefined);
      facadeService.hardDeleteManyUsersById.mockResolvedValue(undefined);
      facadeService.restoreUserById.mockResolvedValue(activeUserFixture);
      facadeService.restoreManyUsersById.mockResolvedValue(activeUsersResponseFixture);

      const createDto: CreateUserInputDto = { name: 'Test', email: 'test@example.com' };
      const createManyDto: CreateManyUsersInputDto = { users: [createDto] };
      const updateDto: UpdateUserDataDto = { name: 'Updated' };
      const deleteDto: DeleteManyUsersInputDto = { ids: ['123e4567-e89b-12d3-a456-426614174000'] };
      const hardDeleteDto: HardDeleteManyUsersInputDto = { ids: ['123e4567-e89b-12d3-a456-426614174000'] };
      const restoreDto: RestoreManyUsersInputDto = { ids: ['123e4567-e89b-12d3-a456-426614174000'] };
      const id = '123e4567-e89b-12d3-a456-426614174000';

      await controller.createUser(createDto);
      expect(facadeService.createUser).toHaveBeenCalledWith(createDto);

      await controller.createManyUsers(createManyDto);
      expect(facadeService.createManyAndReturnUsers).toHaveBeenCalledWith(createManyDto);

      await controller.updateUser(id, updateDto);
      expect(facadeService.updateUserById).toHaveBeenCalledWith({ id, data: updateDto });

      await controller.deleteUser(id);
      expect(facadeService.deleteUserById).toHaveBeenCalledWith({ id });

      await controller.deleteManyUsers(deleteDto);
      expect(facadeService.deleteManyUsersById).toHaveBeenCalledWith(deleteDto);

      await controller.hardDeleteUser(id);
      expect(facadeService.hardDeleteUserById).toHaveBeenCalledWith({ id });

      await controller.hardDeleteManyUsers(hardDeleteDto);
      expect(facadeService.hardDeleteManyUsersById).toHaveBeenCalledWith(hardDeleteDto);

      await controller.restoreUser(id);
      expect(facadeService.restoreUserById).toHaveBeenCalledWith({ id });

      await controller.restoreManyUsers(restoreDto);
      expect(facadeService.restoreManyUsersById).toHaveBeenCalledWith(restoreDto);
    });
  });

  describe('Error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom error');
      customError.stack = 'Original stack';
      facadeService.createUser.mockRejectedValue(customError);

      const response = await httpTester
        .post('/api/users')
        .send({ name: 'Test', email: 'test@example.com' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Internal server error');
    });

    it('should handle validation pipe errors', async () => {
      await expectUuidValidationError(httpTester.get('/api/users/active_users/not-a-uuid'));
    });
  });

  describe('Edge cases', () => {
    it('should handle very large ids array', async () => {
      const largeIds = Array.from(
        { length: 100 },
        (_, i) => `${i.toString().padStart(8, '0')}-e89b-12d3-a456-426614174000`,
      );
      facadeService.findManyUsers.mockResolvedValue({ users: [] });

      await httpTester.get('/api/users/active_users').query({ ids: largeIds }).expect(HttpStatus.OK);

      expect(facadeService.findManyUsers).toHaveBeenCalledWith({ ids: largeIds });
    });

    it('should handle special characters in UUIDs', async () => {
      const upperCaseUUID = '123E4567-E89B-12D3-A456-426614174000';
      facadeService.findUserById.mockResolvedValue(activeUserFixture);

      await httpTester.get(`/api/users/active_users/${upperCaseUUID}`).expect(HttpStatus.OK);
    });

    it('should handle concurrent requests', async () => {
      facadeService.createUser.mockResolvedValue(activeUserFixture);

      await testConcurrentRequests(
        (i) => httpTester.post('/api/users').send({ name: `User ${i}`, email: `user${i}@example.com` }),
        3,
        HttpStatus.CREATED,
      );

      expect(facadeService.createUser).toHaveBeenCalledTimes(3);
    });
  });

  describe('Response structure', () => {
    it('should return proper JSON response for active users', async () => {
      facadeService.findUserById.mockResolvedValue(activeUserFixture);

      const response = await httpTester
        .get(`/api/users/active_users/${activeUserFixture.id}`)
        .expect('Content-Type', /json/u)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).not.toHaveProperty('deletedAt');
    });

    it('should return proper JSON response for deleted users', async () => {
      facadeService.findDeletedUserById.mockResolvedValue(deletedUserFixture);

      const response = await httpTester
        .get(`/api/users/deleted_users/${deletedUserFixture.id}`)
        .expect('Content-Type', /json/u)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('deletedAt');
    });

    it('should return empty body for NO_CONTENT responses', async () => {
      facadeService.deleteUserById.mockResolvedValue(undefined);

      await expectNoContentResponse(httpTester.delete(`/api/users/${activeUserFixture.id}`));
    });
  });
});
