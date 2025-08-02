import { NotFoundException } from '@nestjs/common';

import { createIntegrationTestHelper, type IntegrationTestHelper } from '../../../helpers';

import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { UserModule } from '@/modules/aggregate/user/user.module';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';

describe('userCommandService Integration', () => {
  let helper: IntegrationTestHelper;
  let commandService: UserCommandService;
  let repositoryService: UserRepositoryService;

  beforeAll(async () => {
    helper = createIntegrationTestHelper();
    const { module } = await helper.setup([UserModule], []);
    commandService = module.get<UserCommandService>(UserCommandService);
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
        publicId: expect.any(String),
        name: dto.name,
        email: dto.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const foundUser = await repositoryService.findUniqueUser({ publicId: createdUser.publicId });

      expect(foundUser).toStrictEqual({
        ...createdUser,
        id: expect.any(Number),
      });
    });
  });

  describe('updateUserById', () => {
    it('should update an existing user', async () => {
      expect.assertions(2);

      const createDto = {
        name: 'Original Name',
        email: 'original@test.com',
      };
      const createdUser = await commandService.createUser(createDto);

      const updateDto = {
        publicId: createdUser.publicId,
        data: {
          name: 'Updated Name',
        },
      };
      const updatedUser = await commandService.updateUserById(updateDto);

      expect(updatedUser).toMatchObject({
        publicId: createdUser.publicId,
        name: updateDto.data.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
      });

      const foundUser = await repositoryService.findUniqueUser({ publicId: createdUser.publicId });

      expect(foundUser?.name).toBe(updateDto.data.name);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      expect.assertions(1);

      const updateDto = {
        publicId: '00000000-0000-0000-0000-000000000000',
        data: {
          name: 'Updated Name',
        },
      };

      await expect(commandService.updateUserById(updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user', async () => {
      expect.assertions(1);

      const createDto = {
        name: 'To Delete',
        email: 'todelete@test.com',
      };
      const createdUser = await commandService.createUser(createDto);

      await commandService.deleteUserById({ publicId: createdUser.publicId });

      const user = await repositoryService.findUniqueUser({ publicId: createdUser.publicId });

      expect(user).toBeNull();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      expect.assertions(1);

      const dto = { publicId: '00000000-0000-0000-0000-000000000000' };

      await expect(commandService.deleteUserById(dto)).rejects.toThrow(NotFoundException);
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

      const users = await repositoryService.findManyUsers({});

      expect(users).toHaveLength(3);

      const userEmails = users.map((u) => u.email).sort();

      expect(userEmails).toStrictEqual(['user1@test.com', 'user2@test.com', 'user3@test.com']);
    });
  });

  describe('updateManyUsersById', () => {
    it('should update multiple users', async () => {
      expect.assertions(1);

      const user1 = await commandService.createUser({ name: 'User 1', email: 'user1@test.com' });
      const user2 = await commandService.createUser({ name: 'User 2', email: 'user2@test.com' });

      await commandService.updateUserById({ publicId: user1.publicId, data: { name: 'Updated Name' } });
      await commandService.updateUserById({ publicId: user2.publicId, data: { name: 'Updated Name' } });

      const users = await repositoryService.findManyUsers({
        where: { publicId: { in: [user1.publicId, user2.publicId] } },
      });

      const allUsersUpdated = users.every((u) => u.name === 'Updated Name');

      expect(allUsersUpdated).toBe(true);
    });
  });

  describe('deleteManyUsersById', () => {
    it('should delete multiple users', async () => {
      expect.assertions(1);

      const user1 = await commandService.createUser({ name: 'User 1', email: 'user1@test.com' });
      const user2 = await commandService.createUser({ name: 'User 2', email: 'user2@test.com' });

      const dto = { publicIds: [user1.publicId, user2.publicId] };
      await commandService.deleteManyUsersById(dto);

      const users = await repositoryService.findManyUsers({});

      expect(users).toHaveLength(0);
    });
  });
});
