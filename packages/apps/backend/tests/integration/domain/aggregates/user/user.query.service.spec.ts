import { Test, TestingModule } from '@nestjs/testing';

import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('userQueryService (Integration)', () => {
  let service: UserQueryService;
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

    service = module.get<UserQueryService>(UserQueryService);
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
          email: 'find@example.com',
          name: 'Find Me',
        },
      });

      const result = await service.findUniqueOrThrowUserById({ publicId: created.publicId });

      expect(result.email).toBe('find@example.com');
      expect(result.name).toBe('Find Me');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      expect.assertions(1);

      await expect(
        service.findUniqueOrThrowUserById({ publicId: '00000000-0000-0000-0000-000000000000' }),
      ).rejects.toThrow('No record was found for a query');
    });

    it('should return correct user when multiple users exist', async () => {
      expect.assertions(2);

      await repository.user.create({
        data: {
          email: 'user1@example.com',
          name: 'User 1',
        },
      });

      const targetUser = await repository.user.create({
        data: {
          email: 'target@example.com',
          name: 'Target User',
        },
      });

      await repository.user.create({
        data: {
          email: 'user3@example.com',
          name: 'User 3',
        },
      });

      const result = await service.findUniqueOrThrowUserById({ publicId: targetUser.publicId });

      expect(result.email).toBe('target@example.com');
      expect(result.name).toBe('Target User');
    });
  });

  describe('findUniqueOrThrowUserByEmail', () => {
    it('should find a user by email', async () => {
      expect.assertions(2);

      const created = await repository.user.create({
        data: {
          email: 'unique@example.com',
          name: 'Unique User',
        },
      });

      const result = await service.findUniqueOrThrowUserByEmail('unique@example.com');

      expect(result.publicId).toBe(created.publicId);
      expect(result.name).toBe('Unique User');
    });

    it('should throw NotFoundException for non-existent email', async () => {
      expect.assertions(1);

      await expect(service.findUniqueOrThrowUserByEmail('nonexistent@example.com')).rejects.toThrow(
        'No record was found for a query',
      );
    });

    it('should be case-sensitive for email', async () => {
      expect.assertions(2);

      await repository.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      await expect(service.findUniqueOrThrowUserByEmail('TEST@EXAMPLE.COM')).rejects.toThrow(
        'No record was found for a query',
      );

      const result = await service.findUniqueOrThrowUserByEmail('test@example.com');

      expect(result.name).toBe('Test User');
    });

    it('should find correct user when multiple users exist', async () => {
      expect.assertions(2);

      await repository.user.create({
        data: {
          email: 'first@example.com',
          name: 'First User',
        },
      });

      await repository.user.create({
        data: {
          email: 'second@example.com',
          name: 'Second User',
        },
      });

      await repository.user.create({
        data: {
          email: 'third@example.com',
          name: 'Third User',
        },
      });

      const result = await service.findUniqueOrThrowUserByEmail('second@example.com');

      expect(result.email).toBe('second@example.com');
      expect(result.name).toBe('Second User');
    });
  });

  describe('findManyUsersById', () => {
    it('should find multiple users by publicIds', async () => {
      expect.assertions(4);

      const user1 = await repository.user.create({
        data: {
          email: 'user1@example.com',
          name: 'User 1',
        },
      });

      const user2 = await repository.user.create({
        data: {
          email: 'user2@example.com',
          name: 'User 2',
        },
      });

      await repository.user.create({
        data: {
          email: 'user3@example.com',
          name: 'User 3',
        },
      });

      const result = await service.findManyUsersById({
        publicIds: [user1.publicId, user2.publicId],
      });

      expect(result.users).toHaveLength(2);
      expect(result.users.some((u) => u.email === 'user1@example.com')).toBe(true);
      expect(result.users.some((u) => u.email === 'user2@example.com')).toBe(true);
      expect(result.users.some((u) => u.email === 'user3@example.com')).toBe(false);
    });

    it('should return empty array for non-existent publicIds', async () => {
      expect.assertions(1);

      const result = await service.findManyUsersById({
        publicIds: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'],
      });

      expect(result.users).toHaveLength(0);
    });

    it('should handle mixed existent and non-existent publicIds', async () => {
      expect.assertions(2);

      const user = await repository.user.create({
        data: {
          email: 'exists@example.com',
          name: 'Exists',
        },
      });

      const result = await service.findManyUsersById({
        publicIds: [user.publicId, '00000000-0000-0000-0000-000000000000'],
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toBe('exists@example.com');
    });

    it('should handle empty publicIds array', async () => {
      expect.assertions(1);

      const result = await service.findManyUsersById({ publicIds: [] });

      expect(result.users).toHaveLength(0);
    });

    it('should handle duplicate publicIds in request', async () => {
      expect.assertions(2);

      const user = await repository.user.create({
        data: {
          email: 'single@example.com',
          name: 'Single User',
        },
      });

      const result = await service.findManyUsersById({
        publicIds: [user.publicId, user.publicId, user.publicId],
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toBe('single@example.com');
    });

    it('should find all requested users when they exist', async () => {
      expect.assertions(6);

      const users = await Promise.all([
        repository.user.create({
          data: { email: 'a@example.com', name: 'User A' },
        }),
        repository.user.create({
          data: { email: 'b@example.com', name: 'User B' },
        }),
        repository.user.create({
          data: { email: 'c@example.com', name: 'User C' },
        }),
        repository.user.create({
          data: { email: 'd@example.com', name: 'User D' },
        }),
      ]);

      const result = await service.findManyUsersById({
        publicIds: users.map((u) => u.publicId),
      });

      expect(result.users).toHaveLength(4);
      expect(result.users.some((u) => u.email === 'a@example.com')).toBe(true);
      expect(result.users.some((u) => u.email === 'b@example.com')).toBe(true);
      expect(result.users.some((u) => u.email === 'c@example.com')).toBe(true);
      expect(result.users.some((u) => u.email === 'd@example.com')).toBe(true);

      const emails = result.users.map((u) => u.email).sort();

      expect(emails).toStrictEqual(['a@example.com', 'b@example.com', 'c@example.com', 'd@example.com']);
    });
  });
});
