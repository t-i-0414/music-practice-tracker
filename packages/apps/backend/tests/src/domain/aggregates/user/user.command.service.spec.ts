import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration UserCommandService', () => {
  let userCommandService: UserCommandService;
  let userQueryService: UserQueryService;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCommandService,
        UserQueryService,
        {
          provide: RepositoryService,
          useValue: databaseHelper.client,
        },
        {
          provide: DomainEventPublisher,
          useValue: { publishAll: jest.fn() },
        },
      ],
    }).compile();

    userCommandService = module.get<UserCommandService>(UserCommandService);
    userQueryService = module.get<UserQueryService>(UserQueryService);
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('createUser', () => {
    it('should create a user in the database', async () => {
      expect.assertions(3);

      const createDto = {
        name: 'Test User',
        firebaseUid: 'uid-int-create',
      };

      const result = await userCommandService.createUser(createDto);

      expect(result).toMatchObject({
        name: createDto.name,
      });
      expect(result.publicId).toBeDefined();

      const foundUser = await userQueryService.findUniqueOrThrowUserById({ publicId: result.publicId });

      expect(foundUser).toMatchObject({
        name: createDto.name,
      });
    });

    it('should throw error for duplicate firebaseUid', async () => {
      expect.assertions(1);

      const createDto = {
        name: 'User 1',
        firebaseUid: 'uid-int-dup',
      };

      await userCommandService.createUser(createDto);

      await expect(userCommandService.createUser({ name: 'User 2', firebaseUid: 'uid-int-dup' })).rejects.toThrow(
        'Unique constraint failed',
      );
    });
  });

  describe('updateUserById', () => {
    it('should update a user in the database', async () => {
      expect.assertions(3);

      const createDto = {
        name: 'Original Name',
        firebaseUid: 'uid-int-update',
      };

      const created = await userCommandService.createUser(createDto);
      const updateData = { name: 'Updated Name' };

      const result = await userCommandService.updateUserById({
        publicId: created.publicId,
        data: updateData,
      });

      expect(result.name).toBe(updateData.name);
      expect(result.publicId).toBe(created.publicId);

      const foundUser = await userQueryService.findUniqueOrThrowUserById({ publicId: created.publicId });

      expect(foundUser.name).toBe(updateData.name);
    });

    it('should throw error for non-existent user', async () => {
      expect.assertions(1);

      await expect(
        userCommandService.updateUserById({
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
        name: 'Delete Me',
        firebaseUid: 'uid-int-delete',
      };

      const created = await userCommandService.createUser(createDto);
      await userCommandService.deleteUserById({ publicId: created.publicId });

      await expect(userQueryService.findUniqueOrThrowUserById({ publicId: created.publicId })).rejects.toThrow(
        'No record was found for a query',
      );
    });

    it('should throw error for non-existent user', async () => {
      expect.assertions(1);

      await expect(
        userCommandService.deleteUserById({
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
          { name: 'User 1', firebaseUid: 'uid-int-bulk-1' },
          { name: 'User 2', firebaseUid: 'uid-int-bulk-2' },
          { name: 'User 3', firebaseUid: 'uid-int-bulk-3' },
        ],
      };

      const result = await userCommandService.createManyAndReturnUsers(createDto);

      expect(result.users).toHaveLength(3);
      expect(result.users.map((u) => u.name)).toStrictEqual(['User 1', 'User 2', 'User 3']);
      expect(result.users.map((u) => u.firebaseUid)).toStrictEqual([
        'uid-int-bulk-1',
        'uid-int-bulk-2',
        'uid-int-bulk-3',
      ]);

      const allUsers = await userQueryService.findManyUsersById({
        publicIds: result.users.map((u) => u.publicId),
      });

      expect(allUsers.users).toHaveLength(3);
      expect(new Set(allUsers.users.map((u) => u.publicId)).size).toBe(3);
    });
  });

  describe('deleteManyUsersByIds', () => {
    it('should delete multiple users from the database', async () => {
      expect.assertions(1);

      const users = await userCommandService.createManyAndReturnUsers({
        users: [
          { name: 'Delete 1', firebaseUid: 'uid-int-del-1' },
          { name: 'Delete 2', firebaseUid: 'uid-int-del-2' },
          { name: 'Keep Me', firebaseUid: 'uid-int-keep' },
        ],
      });

      const publicIdsToDelete = [users.users[0].publicId, users.users[1].publicId];
      await userCommandService.deleteManyUsersById({ publicIds: publicIdsToDelete });

      const remainingUser = await userQueryService.findUniqueOrThrowUserById({ publicId: users.users[2].publicId });

      expect(remainingUser.name).toBe('Keep Me');
    });
  });
});
