import { NotFoundException } from '@nestjs/common';

import { createIntegrationTestHelper, type IntegrationTestHelper } from '../../../helpers';

import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { UserModule } from '@/modules/aggregate/user/user.module';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';

describe('userCommandService Integration', () => {
  let helper: IntegrationTestHelper;
  let commandService: UserCommandService;
  let queryService: UserQueryService;
  let repositoryService: UserRepositoryService;

  beforeAll(async () => {
    helper = createIntegrationTestHelper();
    const { module } = await helper.setup([UserModule], []);
    commandService = module.get<UserCommandService>(UserCommandService);
    queryService = module.get<UserQueryService>(UserQueryService);
    repositoryService = module.get<UserRepositoryService>(UserRepositoryService);
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      expect.assertions(2);

      const dto = {
        name: 'Command Service Test User',
        email: 'command@test.com',
      };

      const createdUser = await commandService.createUser(dto);

      expect(createdUser).toMatchObject({
        id: expect.any(String),
        name: dto.name,
        email: dto.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Verify in database
      const foundUser = await repositoryService.findUniqueActiveUser({ id: createdUser.id });

      expect(foundUser).toStrictEqual({
        ...createdUser,
        deletedAt: null,
      });
    });
  });

  describe('updateUserById', () => {
    it('should update an existing user', async () => {
      expect.assertions(2);

      // Create user first
      const createDto = {
        name: 'Original Name',
        email: 'original@test.com',
      };
      const createdUser = await commandService.createUser(createDto);

      // Update user
      const updateDto = {
        id: createdUser.id,
        data: {
          name: 'Updated Name',
        },
      };
      const updatedUser = await commandService.updateUserById(updateDto);

      expect(updatedUser).toMatchObject({
        id: createdUser.id,
        name: updateDto.data.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
      });

      // Verify in database
      const foundUser = await repositoryService.findUniqueActiveUser({ id: createdUser.id });

      expect(foundUser?.name).toBe(updateDto.data.name);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      expect.assertions(1);

      const updateDto = {
        id: '00000000-0000-0000-0000-000000000000',
        data: {
          name: 'Updated Name',
        },
      };

      await expect(commandService.updateUserById(updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserById', () => {
    it('should soft delete a user', async () => {
      expect.assertions(3);

      // Create user first
      const createDto = {
        name: 'To Delete',
        email: 'todelete@test.com',
      };
      const createdUser = await commandService.createUser(createDto);

      // Delete user
      await commandService.deleteUserById({ id: createdUser.id });

      // Verify user is soft deleted
      const activeUser = await repositoryService.findUniqueActiveUser({ id: createdUser.id });

      expect(activeUser).toBeNull();

      const deletedUser = await repositoryService.findUniqueDeletedUser({ id: createdUser.id });

      expect(deletedUser).toBeTruthy();
      expect(deletedUser?.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      expect.assertions(1);

      const dto = { id: '00000000-0000-0000-0000-000000000000' };

      await expect(commandService.deleteUserById(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDeleteUserById', () => {
    it('should permanently delete a user', async () => {
      expect.assertions(2);

      // Create user first
      const createDto = {
        name: 'To Hard Delete',
        email: 'toharddelete@test.com',
      };
      const createdUser = await commandService.createUser(createDto);

      // Hard delete user
      await commandService.hardDeleteUserById({ id: createdUser.id });

      // Verify user is completely gone
      const anyUser = await repositoryService.findUniqueAnyUser({ id: createdUser.id });

      expect(anyUser).toBeNull();

      // Should throw when trying to find
      await expect(queryService.findUserByIdOrFail({ id: createdUser.id })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      expect.assertions(1);

      const dto = { id: '00000000-0000-0000-0000-000000000000' };

      await expect(commandService.hardDeleteUserById(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restoreUserById', () => {
    it('should restore a soft-deleted user', async () => {
      expect.assertions(1);

      // Create and delete user first
      const createDto = {
        name: 'To Restore',
        email: 'torestore@test.com',
      };
      const createdUser = await commandService.createUser(createDto);
      await commandService.deleteUserById({ id: createdUser.id });

      // Restore user
      const restoredUser = await commandService.restoreUserById({ id: createdUser.id });

      expect(restoredUser).toMatchObject({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error for non-existent user', async () => {
      expect.assertions(1);

      const dto = { id: '00000000-0000-0000-0000-000000000000' };

      await expect(commandService.restoreUserById(dto)).rejects.toThrow(Error);
    });
  });

  describe('createManyUsers', () => {
    it('should create multiple users', async () => {
      expect.assertions(3);

      const dto = {
        users: [
          { name: 'User 1', email: 'user1@test.com' },
          { name: 'User 2', email: 'user2@test.com' },
          { name: 'User 3', email: 'user3@test.com' },
        ],
      };

      const createdUsers = await commandService.createManyAndReturnUsers(dto);

      expect(createdUsers.users).toHaveLength(3);

      // Verify all users were created
      const users = await repositoryService.findManyActiveUsers({});

      expect(users).toHaveLength(3);

      const userEmails = users.map((u) => u.email).sort();

      expect(userEmails).toStrictEqual(['user1@test.com', 'user2@test.com', 'user3@test.com']);
    });
  });

  describe('updateManyUsersById', () => {
    it('should update multiple users', async () => {
      expect.assertions(1);

      // Create users first
      const user1 = await commandService.createUser({ name: 'User 1', email: 'user1@test.com' });
      const user2 = await commandService.createUser({ name: 'User 2', email: 'user2@test.com' });

      // Update users
      await commandService.deleteManyUsersById({ ids: [user1.id, user2.id] });
      await commandService.restoreManyUsersById({ ids: [user1.id, user2.id] });

      // Update separately as there's no updateManyUsersById
      await commandService.updateUserById({ id: user1.id, data: { name: 'Updated Name' } });
      await commandService.updateUserById({ id: user2.id, data: { name: 'Updated Name' } });

      // Verify both users were updated

      // Verify updates
      const users = await repositoryService.findManyActiveUsers({
        where: { id: { in: [user1.id, user2.id] } },
      });

      const allUsersUpdated = users.every((u) => u.name === 'Updated Name');

      expect(allUsersUpdated).toBe(true);
    });
  });

  describe('deleteManyUsersById', () => {
    it('should soft delete multiple users', async () => {
      expect.assertions(2);

      // Create users first
      const user1 = await commandService.createUser({ name: 'User 1', email: 'user1@test.com' });
      const user2 = await commandService.createUser({ name: 'User 2', email: 'user2@test.com' });

      // Delete users
      const dto = { ids: [user1.id, user2.id] };
      await commandService.deleteManyUsersById(dto);

      // Verify deletion

      // Verify soft deletes
      const activeUsers = await repositoryService.findManyActiveUsers({});

      expect(activeUsers).toHaveLength(0);

      const deletedUsers = await repositoryService.findManyDeletedUsers({});

      expect(deletedUsers).toHaveLength(2);
    });
  });
});
