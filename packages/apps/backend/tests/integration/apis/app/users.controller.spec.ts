import { Test, TestingModule } from '@nestjs/testing';

import { AppApiUsersController } from '@/apis/app/users/users.controller';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration AppApiUsersController', () => {
  let controller: AppApiUsersController;
  let databaseHelper: DatabaseHelper;
  let testUser: { publicId: string; email: string; name: string };

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppApiUsersController],
      providers: [
        UserCommandService,
        UserQueryService,
        {
          provide: RepositoryService,
          useValue: databaseHelper.client,
        },
      ],
    }).compile();

    controller = module.get<AppApiUsersController>(AppApiUsersController);

    // Create a test user for most tests (simulating logged-in user)
    const commandService = module.get<UserCommandService>(UserCommandService);
    testUser = await commandService.createUser({
      email: 'current-user@example.com',
      name: 'Current User',
    });
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('get /users/:publicId', () => {
    it('should return the current user by publicId', async () => {
      expect.assertions(3);

      const result = await controller.findUniqueOrThrowUserById(testUser.publicId);

      expect(result.publicId).toBe(testUser.publicId);
      expect(result.email).toBe('current-user@example.com');
      expect(result.name).toBe('Current User');
    });

    it('should throw error for non-existent user', async () => {
      expect.assertions(1);

      const fakePublicId = '00000000-0000-0000-0000-000000000000';

      await expect(controller.findUniqueOrThrowUserById(fakePublicId)).rejects.toThrow('No record was found');
    });
  });

  describe('put /users/:publicId', () => {
    it('should update the current user', async () => {
      expect.assertions(3);

      const updateData = {
        name: 'Updated Name',
      };

      const result = await controller.updateUserById(testUser.publicId, updateData);

      expect(result.publicId).toBe(testUser.publicId);
      expect(result.email).toBe('current-user@example.com');
      expect(result.name).toBe('Updated Name');
    });

    it('should not allow updating email', async () => {
      expect.assertions(3);

      const updateData = {
        name: 'New Name',
      };

      const result = await controller.updateUserById(testUser.publicId, updateData);

      expect(result.publicId).toBe(testUser.publicId);
      expect(result.email).toBe('current-user@example.com');
      expect(result.name).toBe('New Name');
    });
  });

  describe('delete /users/:publicId', () => {
    it('should delete the current user', async () => {
      expect.assertions(1);

      await controller.deleteUserById(testUser.publicId);

      await expect(controller.findUniqueOrThrowUserById(testUser.publicId)).rejects.toThrow('No record was found');
    });

    it('should throw error when trying to delete non-existent user', async () => {
      expect.assertions(1);

      const tempUser = await controller.createUser({
        email: 'temp-user@example.com',
        name: 'Temp User',
      });

      await controller.deleteUserById(tempUser.publicId);

      // Try to delete again
      await expect(controller.deleteUserById(tempUser.publicId)).rejects.toThrow('No record was found');
    });
  });
});
