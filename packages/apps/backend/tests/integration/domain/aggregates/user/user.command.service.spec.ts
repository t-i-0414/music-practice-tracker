import { setupUserServicesIntegration } from '../../helpers/domain-integration.helper';

import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration UserCommandService', () => {
  let service: UserCommandService;
  let queryService: UserQueryService;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const { commandService, queryService: qService } = await setupUserServicesIntegration(databaseHelper);
    service = commandService;
    queryService = qService;
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('createUser', () => {
    it('should create a user in the database', async () => {
      expect.assertions(3);

      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = await service.createUser(createDto);

      expect(result).toMatchObject({
        email: createDto.email,
        name: createDto.name,
      });
      expect(result.publicId).toBeDefined();

      const foundUser = await queryService.findUniqueOrThrowUserById({ publicId: result.publicId });

      expect(foundUser).toMatchObject({
        email: createDto.email,
        name: createDto.name,
      });
    });

    it('should throw error for duplicate email', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'duplicate@example.com',
        name: 'User 1',
      };

      await service.createUser(createDto);

      await expect(
        service.createUser({
          email: createDto.email,
          name: 'User 2',
        }),
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('updateUserById', () => {
    it('should update a user in the database', async () => {
      expect.assertions(3);

      const createDto = {
        email: 'update@example.com',
        name: 'Original Name',
      };

      const created = await service.createUser(createDto);
      const updateData = { name: 'Updated Name' };

      const result = await service.updateUserById({
        publicId: created.publicId,
        data: updateData,
      });

      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(createDto.email);

      const foundUser = await queryService.findUniqueOrThrowUserById({ publicId: created.publicId });

      expect(foundUser.name).toBe(updateData.name);
    });

    it('should throw error for non-existent user', async () => {
      expect.assertions(1);

      await expect(
        service.updateUserById({
          publicId: '00000000-0000-0000-0000-000000000000',
          data: { name: 'New Name' },
        }),
      ).rejects.toThrow('No record was found for an update');
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user from the database', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'delete@example.com',
        name: 'Delete Me',
      };

      const created = await service.createUser(createDto);
      await service.deleteUserById({ publicId: created.publicId });

      await expect(queryService.findUniqueOrThrowUserById({ publicId: created.publicId })).rejects.toThrow(
        'No record was found for a query',
      );
    });

    it('should throw error for non-existent user', async () => {
      expect.assertions(1);

      await expect(
        service.deleteUserById({
          publicId: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toThrow('No record was found for a delete');
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should create multiple users in the database', async () => {
      expect.assertions(5);

      const createDto = {
        users: [
          { email: 'user1@example.com', name: 'User 1' },
          { email: 'user2@example.com', name: 'User 2' },
          { email: 'user3@example.com', name: 'User 3' },
        ],
      };

      const result = await service.createManyAndReturnUsers(createDto);

      expect(result.users).toHaveLength(3);
      expect(result.users[0].email).toBe('user1@example.com');
      expect(result.users[1].email).toBe('user2@example.com');
      expect(result.users[2].email).toBe('user3@example.com');

      const allUsers = await queryService.findManyUsersById({
        publicIds: result.users.map((u) => u.publicId),
      });

      expect(allUsers.users).toHaveLength(3);
    });
  });

  describe('deleteManyUsersByIds', () => {
    it('should delete multiple users from the database', async () => {
      expect.assertions(1);

      const users = await service.createManyAndReturnUsers({
        users: [
          { email: 'del1@example.com', name: 'Delete 1' },
          { email: 'del2@example.com', name: 'Delete 2' },
          { email: 'keep@example.com', name: 'Keep Me' },
        ],
      });

      const publicIdsToDelete = [users.users[0].publicId, users.users[1].publicId];
      await service.deleteManyUsersById({ publicIds: publicIdsToDelete });

      const remainingUser = await queryService.findUniqueOrThrowUserById({ publicId: users.users[2].publicId });

      expect(remainingUser.email).toBe('keep@example.com');
    });
  });
});
