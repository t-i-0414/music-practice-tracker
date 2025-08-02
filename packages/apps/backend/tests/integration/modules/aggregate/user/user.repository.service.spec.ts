import { randomUUID } from 'crypto';

import { createIntegrationTestHelper, IntegrationTestHelper } from '../../../helpers';

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
        status: 'PENDING',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const foundUser = await service.findUniqueUser({ publicId: createdUser.publicId });

      expect(foundUser).toStrictEqual(createdUser);
    });
  });

  describe('findUniqueUser', () => {
    it('should find an user by publicId', async () => {
      expect.assertions(1);

      const userData = {
        name: 'Find Test User',
        email: 'find@test.com',
      };
      const createdUser = await service.createUser(userData);

      const foundUser = await service.findUniqueUser({ publicId: createdUser.publicId });

      expect(foundUser).toStrictEqual(createdUser);
    });

    it('should return null for non-existent user', async () => {
      expect.assertions(1);

      const foundUser = await service.findUniqueUser({ publicId: '00000000-0000-0000-0000-000000000000' });

      expect(foundUser).toBeNull();
    });

    it('should not find deleted users', async () => {
      expect.assertions(1);

      const userData = {
        name: 'Delete Test User',
        email: 'delete@test.com',
      };
      const createdUser = await service.createUser(userData);

      await service.deleteUser({ publicId: createdUser.publicId });

      const foundUser = await service.findUniqueUser({ publicId: createdUser.publicId });

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
        status: createdUser.status,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
      });
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(createdUser.updatedAt.getTime());
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      expect.assertions(1);

      const userData = {
        name: 'To Be Deleted',
        email: 'tobedeleted@test.com',
      };
      const createdUser = await service.createUser(userData);

      await service.deleteUser({ publicId: createdUser.publicId });

      const user = await service.findUniqueUser({ publicId: createdUser.publicId });

      expect(user).toBeNull();
    });
  });

  describe('findManyUsers', () => {
    it('should find multiple users with filters', async () => {
      expect.assertions(1);

      await service.createUser({ name: 'User 1', email: `user1-${randomUUID()}@test.com` });
      await service.createUser({ name: 'User 2', email: `user2-${randomUUID()}@test.com` });

      const users = await service.findManyUsers({});

      expect(users).toHaveLength(2);
    });
  });
});
