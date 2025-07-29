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
        id: expect.any(Number),
        publicId: expect.any(String),
        name: userData.name,
        email: userData.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        suspendedAt: null,
      });

      const foundUser = await service.findUniqueActiveUser({ publicId: createdUser.publicId });

      expect(foundUser).toStrictEqual(createdUser);
    });
  });

  describe('findUniqueActiveUser', () => {
    it('should find an active user by publicId', async () => {
      expect.assertions(1);

      const userData = {
        name: 'Find Test User',
        email: 'find@test.com',
      };
      const createdUser = await service.createUser(userData);

      const foundUser = await service.findUniqueActiveUser({ publicId: createdUser.publicId });

      expect(foundUser).toStrictEqual(createdUser);
    });

    it('should return null for non-existent user', async () => {
      expect.assertions(1);

      const foundUser = await service.findUniqueActiveUser({ publicId: '00000000-0000-0000-0000-000000000000' });

      expect(foundUser).toBeNull();
    });

    it('should not find soft-deleted users', async () => {
      expect.assertions(1);

      const userData = {
        name: 'Delete Test User',
        email: 'delete@test.com',
      };
      const createdUser = await service.createUser(userData);

      await service.deleteUser({ publicId: createdUser.publicId });

      const foundUser = await service.findUniqueActiveUser({ publicId: createdUser.publicId });

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
        where: { publicId: createdUser.publicId },
        data: updateData,
      });

      expect(updatedUser).toStrictEqual({
        id: createdUser.id,
        publicId: createdUser.publicId,
        name: updateData.name,
        email: updateData.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
        deletedAt: null,
        suspendedAt: null,
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

      await service.deleteUser({ publicId: createdUser.publicId });

      const deletedUser = await service.findUniqueDeletedUser({ publicId: createdUser.publicId });

      expect(deletedUser).toStrictEqual({
        id: createdUser.id,
        publicId: createdUser.publicId,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
        deletedAt: expect.any(Date),
        suspendedAt: null,
      });

      const activeUser = await service.findUniqueActiveUser({ publicId: createdUser.publicId });

      expect(activeUser).toBeNull();

      const deletedFoundUser = await service.findUniqueDeletedUser({ publicId: createdUser.publicId });

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
      await service.deleteUser({ publicId: createdUser.publicId });

      const restoredUser = await service.restoreUser({ publicId: createdUser.publicId });

      expect(restoredUser).toStrictEqual({
        id: createdUser.id,
        publicId: createdUser.publicId,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
        deletedAt: null,
        suspendedAt: null,
      });

      const activeUser = await service.findUniqueActiveUser({ publicId: createdUser.publicId });

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

      await service.hardDeleteUser({ publicId: createdUser.publicId });

      const activeUser = await service.findUniqueActiveUser({ publicId: createdUser.publicId });

      expect(activeUser).toBeNull();

      const deletedUser = await service.findUniqueDeletedUser({ publicId: createdUser.publicId });

      expect(deletedUser).toBeNull();

      const anyUser = await service.findUniqueAnyUser({ publicId: createdUser.publicId });

      expect(anyUser).toBeNull();
    });
  });

  describe('findManyUsers', () => {
    it('should find multiple users with filters', async () => {
      expect.assertions(5);

      await service.createUser({ name: 'User 1', email: `user1-${randomUUID()}@test.com` });
      await service.createUser({ name: 'User 2', email: `user2-${randomUUID()}@test.com` });
      const deletedUser = await service.createUser({ name: 'User 3', email: `user3-${randomUUID()}@test.com` });
      await service.deleteUser({ publicId: deletedUser.publicId });

      const activeUsers = await service.findManyActiveUsers({});

      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every((user) => user.deletedAt === null)).toBe(true);

      const deletedUsers = await service.findManyDeletedUsers({});

      expect(deletedUsers).toHaveLength(1);
      expect(deletedUsers[0]?.publicId).toBe(deletedUser.publicId);

      const allUsers = await service.findManyAnyUsers({});

      expect(allUsers).toHaveLength(3);
    });
  });

  describe('suspendUser', () => {
    it('should suspend an active user', async () => {
      expect.assertions(3);

      const userData = {
        name: 'User to Suspend',
        email: `suspend-${randomUUID()}@test.com`,
      };
      const createdUser = await service.createUser(userData);

      const suspendedUser = await service.suspendUser({ publicId: createdUser.publicId });

      expect(suspendedUser.publicId).toBe(createdUser.publicId);
      expect(suspendedUser.suspendedAt).not.toBeNull();
      expect(suspendedUser.suspendedAt).toBeInstanceOf(Date);
    });

    it('should not suspend already suspended user', async () => {
      expect.assertions(1);

      const userData = {
        name: 'Already Suspended User',
        email: `already-suspended-${randomUUID()}@test.com`,
      };
      const createdUser = await service.createUser(userData);
      await service.suspendUser({ publicId: createdUser.publicId });

      await expect(service.suspendUser({ publicId: createdUser.publicId })).rejects.toThrow(
        expect.objectContaining({
          code: 'P2025',
        }),
      );
    });
  });

  describe('suspendManyUsers', () => {
    it('should suspend multiple users', async () => {
      expect.assertions(3);

      const user1 = await service.createUser({
        name: 'User 1',
        email: `suspend-many-1-${randomUUID()}@test.com`,
      });
      const user2 = await service.createUser({
        name: 'User 2',
        email: `suspend-many-2-${randomUUID()}@test.com`,
      });

      await service.suspendManyUsers({
        publicId: { in: [user1.publicId, user2.publicId] },
      });

      const suspendedUser1 = await service.findUniqueActiveUser({ publicId: user1.publicId });
      const suspendedUser2 = await service.findUniqueActiveUser({ publicId: user2.publicId });

      expect(suspendedUser1).toBeNull();
      expect(suspendedUser2).toBeNull();

      const anyUser1 = await service.findUniqueAnyUser({ publicId: user1.publicId });

      expect(anyUser1?.suspendedAt).not.toBeNull();
    });
  });
});
