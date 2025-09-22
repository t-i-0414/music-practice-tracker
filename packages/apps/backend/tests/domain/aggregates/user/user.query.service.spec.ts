import { Test, TestingModule } from '@nestjs/testing';

import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/_helpers/database.helper';

describe('integration UserQueryService', () => {
  let userQueryService: UserQueryService;
  let databaseHelper: DatabaseHelper;
  let repository: any;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserQueryService,
        {
          provide: RepositoryService,
          useValue: databaseHelper.client,
        },
      ],
    }).compile();

    userQueryService = module.get<UserQueryService>(UserQueryService);
    repository = databaseHelper.client;
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('findUniqueOrThrowUserById', () => {
    it('should find a user by publicId', async () => {
      expect.assertions(2);

      const created = await repository.user.create({
        data: {
          name: 'Find Me',
          firebaseUid: 'uid-int-find-by-id-1',
        },
      });

      const result = await userQueryService.findUniqueOrThrowUserById({ publicId: created.publicId });

      expect(result.name).toBe('Find Me');
      expect(result.firebaseUid).toBe('uid-int-find-by-id-1');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      expect.assertions(1);

      await expect(
        userQueryService.findUniqueOrThrowUserById({ publicId: '00000000-0000-0000-0000-000000000000' }),
      ).rejects.toThrow('No record was found for a query');
    });

    it('should return correct user when multiple users exist', async () => {
      expect.assertions(2);

      await repository.user.create({
        data: {
          name: 'User 1',
          firebaseUid: 'uid-int-many-1',
        },
      });

      const targetUser = await repository.user.create({
        data: {
          name: 'Target User',
          firebaseUid: 'uid-int-many-2',
        },
      });

      await repository.user.create({
        data: {
          name: 'User 3',
          firebaseUid: 'uid-int-many-3',
        },
      });

      const result = await userQueryService.findUniqueOrThrowUserById({ publicId: targetUser.publicId });

      expect(result.name).toBe('Target User');
      expect(result.firebaseUid).toBe('uid-int-many-2');
    });
  });

  describe('findManyUsersById', () => {
    it('should find multiple users by publicIds', async () => {
      expect.assertions(4);

      const user1 = await repository.user.create({
        data: {
          name: 'User 1',
          firebaseUid: 'uid-int-many-list-1',
        },
      });

      const user2 = await repository.user.create({
        data: {
          name: 'User 2',
          firebaseUid: 'uid-int-many-list-2',
        },
      });

      await repository.user.create({
        data: {
          name: 'User 3',
          firebaseUid: 'uid-int-many-list-3',
        },
      });

      const result = await userQueryService.findManyUsersById({
        publicIds: [user1.publicId, user2.publicId],
      });

      expect(result.users).toHaveLength(2);

      const ids = result.users.map((u) => u.publicId).sort((a, b) => a.localeCompare(b));

      const expected = [user1.publicId, user2.publicId].sort((a, b) => a.localeCompare(b));

      expect(ids).toStrictEqual(expected);
      expect(result.users.map((u) => u.name).sort()).toStrictEqual(['User 1', 'User 2']);
      expect(result.users.map((u) => u.firebaseUid).sort()).toStrictEqual([
        'uid-int-many-list-1',
        'uid-int-many-list-2',
      ]);
    });

    it('should return empty array for non-existent publicIds', async () => {
      expect.assertions(1);

      const result = await userQueryService.findManyUsersById({
        publicIds: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'],
      });

      expect(result.users).toHaveLength(0);
    });

    it('should handle mixed existent and non-existent publicIds', async () => {
      expect.assertions(2);

      const user = await repository.user.create({
        data: {
          name: 'Exists',
          firebaseUid: 'uid-int-exists',
        },
      });

      const result = await userQueryService.findManyUsersById({
        publicIds: [user.publicId, '00000000-0000-0000-0000-000000000000'],
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].publicId).toBe(user.publicId);
    });

    it('should handle empty publicIds array', async () => {
      expect.assertions(1);

      const result = await userQueryService.findManyUsersById({ publicIds: [] });

      expect(result.users).toHaveLength(0);
    });

    it('should handle duplicate publicIds in request', async () => {
      expect.assertions(2);

      const user = await repository.user.create({
        data: {
          name: 'Single User',
          firebaseUid: 'uid-int-dup-request',
        },
      });

      const result = await userQueryService.findManyUsersById({
        publicIds: [user.publicId, user.publicId, user.publicId],
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].publicId).toBe(user.publicId);
    });

    it('should find all requested users when they exist', async () => {
      expect.assertions(6);

      const users = await Promise.all([
        repository.user.create({ data: { name: 'User A', firebaseUid: 'uid-int-all-a' } }),
        repository.user.create({ data: { name: 'User B', firebaseUid: 'uid-int-all-b' } }),
        repository.user.create({ data: { name: 'User C', firebaseUid: 'uid-int-all-c' } }),
        repository.user.create({ data: { name: 'User D', firebaseUid: 'uid-int-all-d' } }),
      ]);

      const result = await userQueryService.findManyUsersById({
        publicIds: users.map((u) => u.publicId),
      });

      expect(result.users).toHaveLength(4);

      const resultNames = result.users.map((u) => u.name).sort();

      expect(resultNames).toContain('User A');
      expect(resultNames).toContain('User B');
      expect(resultNames).toContain('User C');
      expect(resultNames).toContain('User D');

      const names = result.users.map((u) => u.name).sort((a, b) => a.localeCompare(b));

      expect(names).toStrictEqual(['User A', 'User B', 'User C', 'User D']);
    });
  });
});
