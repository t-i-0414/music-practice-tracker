import { randomUUID } from 'crypto';

import { createIntegrationTestHelper, type IntegrationTestHelper } from '../../../helpers';

import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';

describe('userRepositoryService Integration', () => {
  let helper: IntegrationTestHelper;
  let service: UserRepositoryService;

  beforeAll(async () => {
    helper = createIntegrationTestHelper();
    const { module } = await helper.setup([], [UserRepositoryService]);
    service = module.get<UserRepositoryService>(UserRepositoryService);
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  describe('createUser', () => {
    it('should create a new user in the database', async () => {
      expect.assertions(2);

      const userData = {
        name: 'Integration Test User',
        email: 'integration@test.com',
      };

      const createdUser = await service.createUser(userData);

      expect(createdUser).toStrictEqual({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
      });

      const foundUser = await service.findUniqueActiveUser({ id: createdUser.id });

      expect(foundUser).toStrictEqual(createdUser);
    });
  });

  describe('findUniqueActiveUser', () => {
    it('should find an active user by id', async () => {
      expect.assertions(1);

      const userData = {
        name: 'Find Test User',
        email: 'find@test.com',
      };
      const createdUser = await service.createUser(userData);

      const foundUser = await service.findUniqueActiveUser({ id: createdUser.id });

      expect(foundUser).toStrictEqual(createdUser);
    });

    it('should return null for non-existent user', async () => {
      expect.assertions(1);

      const foundUser = await service.findUniqueActiveUser({ id: '00000000-0000-0000-0000-000000000000' });

      expect(foundUser).toBeNull();
    });

    it('should not find soft-deleted users', async () => {
      expect.assertions(1);

      const userData = {
        name: 'Delete Test User',
        email: 'delete@test.com',
      };
      const createdUser = await service.createUser(userData);

      await service.deleteUser({ id: createdUser.id });

      const foundUser = await service.findUniqueActiveUser({ id: createdUser.id });

      expect(foundUser).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      expect.assertions(2);

      const userData = {
        name: 'Original Name',
        email: 'original@test.com',
      };
      const createdUser = await service.createUser(userData);

      // Wait a bit to ensure updatedAt timestamp changes
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com',
      };
      const updatedUser = await service.updateUser({
        where: { id: createdUser.id },
        data: updateData,
      });

      expect(updatedUser).toStrictEqual({
        id: createdUser.id,
        name: updateData.name,
        email: updateData.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
        deletedAt: null,
      });
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(createdUser.updatedAt.getTime());
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      expect.assertions(4);

      const userData = {
        name: 'To Be Deleted',
        email: 'tobedeleted@test.com',
      };
      const createdUser = await service.createUser(userData);

      await service.deleteUser({ id: createdUser.id });

      const deletedUser = await service.findUniqueDeletedUser({ id: createdUser.id });

      expect(deletedUser).toStrictEqual({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
        deletedAt: expect.any(Date),
      });

      const activeUser = await service.findUniqueActiveUser({ id: createdUser.id });

      expect(activeUser).toBeNull();

      const deletedFoundUser = await service.findUniqueDeletedUser({ id: createdUser.id });

      expect(deletedFoundUser).toBeTruthy();
      expect(deletedFoundUser).toStrictEqual(deletedUser);
    });
  });

  describe('restoreUser', () => {
    it('should restore a soft-deleted user', async () => {
      expect.assertions(2);

      const userData = {
        name: 'To Be Restored',
        email: 'toberestored@test.com',
      };
      const createdUser = await service.createUser(userData);
      await service.deleteUser({ id: createdUser.id });

      const restoredUser = await service.restoreUser({ id: createdUser.id });

      expect(restoredUser).toStrictEqual({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
        deletedAt: null,
      });

      const activeUser = await service.findUniqueActiveUser({ id: createdUser.id });

      expect(activeUser).toStrictEqual(restoredUser);
    });
  });

  describe('hardDeleteUser', () => {
    it('should permanently delete a user', async () => {
      expect.assertions(3);

      const userData = {
        name: 'To Be Hard Deleted',
        email: 'tobeharddeleted@test.com',
      };
      const createdUser = await service.createUser(userData);

      await service.hardDeleteUser({ id: createdUser.id });

      const activeUser = await service.findUniqueActiveUser({ id: createdUser.id });

      expect(activeUser).toBeNull();

      const deletedUser = await service.findUniqueDeletedUser({ id: createdUser.id });

      expect(deletedUser).toBeNull();

      const anyUser = await service.findUniqueAnyUser({ id: createdUser.id });

      expect(anyUser).toBeNull();
    });
  });

  describe('findManyUsers', () => {
    it('should find multiple users with filters', async () => {
      expect.assertions(5);

      await service.createUser({ name: 'User 1', email: `user1-${randomUUID()}@test.com` });
      await service.createUser({ name: 'User 2', email: `user2-${randomUUID()}@test.com` });
      const deletedUser = await service.createUser({ name: 'User 3', email: `user3-${randomUUID()}@test.com` });
      await service.deleteUser({ id: deletedUser.id });

      const activeUsers = await service.findManyActiveUsers({});

      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every((user) => user.deletedAt === null)).toBe(true);

      const deletedUsers = await service.findManyDeletedUsers({});

      expect(deletedUsers).toHaveLength(1);
      expect(deletedUsers[0]?.id).toBe(deletedUser.id);

      const allUsers = await service.findManyAnyUsers({});

      expect(allUsers).toHaveLength(3);
    });
  });
});
