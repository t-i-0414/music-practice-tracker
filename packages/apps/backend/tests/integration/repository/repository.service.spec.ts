import { Test, TestingModule } from '@nestjs/testing';

import { UserStatusRecord } from '@/domain/aggregates/user/utils/constants';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration RepositoryService', () => {
  let service: RepositoryService;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RepositoryService,
          useValue: databaseHelper.client,
        },
      ],
    }).compile();

    service = module.get<RepositoryService>(RepositoryService);
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('transaction handling', () => {
    it('should commit transaction on success', async () => {
      expect.assertions(3);

      const result = await service.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: 'Transaction User',
            firebaseUid: 'uid-repo-transaction',
          },
        });

        const adminUser = await tx.adminUser.create({
          data: {
            cognitoSub: 'sub-repo-admin',
            name: 'Admin User',
            role: 'ADMIN',
          },
        });

        return { user, adminUser };
      });

      expect(result.user.name).toBe('Transaction User');
      expect(result.adminUser.cognitoSub).toBe('sub-repo-admin');

      const foundUser = await service.user.findUnique({
        where: { publicId: result.user.publicId },
      });

      expect(foundUser).toBeTruthy();
    });

    it('should rollback transaction on error', async () => {
      expect.assertions(3);

      const countBefore = await service.user.count();

      await expect(
        service.$transaction(async (tx) => {
          await tx.user.create({
            data: {
              name: 'Rollback User',
              firebaseUid: 'uid-repo-rollback',
            },
          });

          throw new Error('Forced rollback');
        }),
      ).rejects.toThrow('Forced rollback');

      const countAfter = await service.user.count();

      expect(countAfter).toBe(countBefore);

      const user = await service.user.findFirst({
        where: { name: 'Rollback User' },
      });

      expect(user).toBeNull();
    });

    it('should rollback all operations in transaction on error', async () => {
      expect.assertions(4);

      const userCountBefore = await service.user.count();
      const adminCountBefore = await service.adminUser.count();

      await expect(
        service.$transaction(async (tx) => {
          await tx.user.create({
            data: {
              name: 'User Rollback',
              firebaseUid: 'uid-repo-user-rollback',
            },
          });

          await tx.adminUser.create({
            data: {
              cognitoSub: 'sub-repo-admin-rollback',
              name: 'Admin Rollback',
              role: 'ADMIN',
            },
          });

          throw new Error('Forced rollback after multiple operations');
        }),
      ).rejects.toThrow('Forced rollback after multiple operations');

      const userCountAfter = await service.user.count();
      const adminCountAfter = await service.adminUser.count();

      expect(userCountAfter).toBe(userCountBefore);
      expect(adminCountAfter).toBe(adminCountBefore);

      const user = await service.user.findFirst({
        where: { name: 'User Rollback' },
      });

      expect(user).toBeNull();
    });

    it('should handle nested transactions', async () => {
      expect.assertions(2);

      const result = await service.$transaction(async (tx) => {
        const user1 = await tx.user.create({
          data: {
            name: 'Nested User 1',
            firebaseUid: 'uid-repo-nested-1',
          },
        });

        const user2 = await tx.user.create({
          data: {
            name: 'Nested User 2',
            firebaseUid: 'uid-repo-nested-2',
          },
        });

        return { user1, user2 };
      });

      expect(result.user1.name).toBe('Nested User 1');
      expect(result.user2.name).toBe('Nested User 2');
    });
  });

  describe('error handling', () => {
    it('should handle unique constraint violations', async () => {
      expect.assertions(2);

      await service.user.create({
        data: {
          name: 'First User',
          firebaseUid: 'uid-repo-dup',
        },
      });

      await expect(
        service.user.create({
          data: {
            name: 'Second User',
            firebaseUid: 'uid-repo-dup',
          },
        }),
      ).rejects.toMatchObject({
        code: 'P2002',
      });

      await expect(
        service.user.create({
          data: {
            name: 'Third User',
            firebaseUid: 'uid-repo-dup',
          },
        }),
      ).rejects.toThrow('Unique constraint failed on the fields');
    });

    it('should handle foreign key constraint violations', async () => {
      expect.assertions(1);

      await expect(
        service.$executeRawUnsafe(
          `INSERT INTO "User" (email, name, "publicId", "createdAt", "updatedAt", status)
          VALUES ($1, $2, $3, NOW(), NOW(), $4)`,
          'fk@example.com',
          'FK User',
          'invalid-uuid',
          'INVALID_STATUS',
        ),
      ).rejects.toBeDefined();
    });

    it('should handle record not found errors', async () => {
      expect.assertions(1);

      await expect(
        service.user.findUniqueOrThrow({
          where: { publicId: '00000000-0000-0000-0000-000000000000' },
        }),
      ).rejects.toThrow('No record was found for a query');
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent reads', async () => {
      expect.assertions(12);

      const user = await service.user.create({
        data: {
          name: 'Concurrent User',
          firebaseUid: 'uid-repo-concurrent',
        },
      });

      const promises = Array.from({ length: 10 }, () =>
        service.user.findUnique({
          where: { publicId: user.publicId },
        }),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);

      results.forEach((result) => {
        expect(result?.name).toBe('Concurrent User');
      });

      expect(results.every((result) => result !== null)).toBe(true);
    });

    it('should handle concurrent writes with different records', async () => {
      expect.assertions(3);

      const promises = Array.from({ length: 5 }, (__, i) =>
        service.user.create({
          data: {
            name: `Concurrent User ${i}`,
            firebaseUid: `uid-repo-concurrent-${i}`,
          },
        }),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);

      const uidList = results.map((r) => r.firebaseUid);

      expect(new Set(uidList).size).toBe(5);
      expect(results[0].firebaseUid).toContain('uid-repo-concurrent-');
    });
  });

  describe('batch operations', () => {
    it('should handle createMany operation', async () => {
      expect.assertions(4);

      const result = await service.user.createManyAndReturn({
        data: [
          { name: 'Batch User 1', firebaseUid: 'uid-repo-batch-1' },
          { name: 'Batch User 2', firebaseUid: 'uid-repo-batch-2' },
          { name: 'Batch User 3', firebaseUid: 'uid-repo-batch-3' },
        ],
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result.map((u) => u.name)).toStrictEqual(['Batch User 1', 'Batch User 2', 'Batch User 3']);
      expect(result.map((u) => u.firebaseUid)).toStrictEqual([
        'uid-repo-batch-1',
        'uid-repo-batch-2',
        'uid-repo-batch-3',
      ]);
    });

    it('should handle updateMany operation', async () => {
      expect.assertions(4);

      await service.user.createManyAndReturn({
        data: [
          { name: 'update-Old Name 1', firebaseUid: 'uid-repo-update-1' },
          { name: 'update-Old Name 2', firebaseUid: 'uid-repo-update-2' },
        ],
      });

      const result = await service.user.updateMany({
        where: {
          name: { contains: 'update' },
        },
        data: {
          status: UserStatusRecord.SUSPENDED,
        },
      });

      expect(result.count).toBe(2);

      const users = await service.user.findMany({
        where: { name: { contains: 'update' } },
      });
      users.forEach((user) => {
        expect(user.status).toBe(UserStatusRecord.SUSPENDED);
      });

      expect(users).toHaveLength(2);
    });

    it('should handle deleteMany operation', async () => {
      expect.assertions(5);

      await service.user.createManyAndReturn({
        data: [
          { name: 'Delete User 1', firebaseUid: 'uid-repo-del-1' },
          { name: 'Delete User 2', firebaseUid: 'uid-repo-del-2' },
          { name: 'Keep User', firebaseUid: 'uid-repo-keep' },
        ],
      });

      const result = await service.user.deleteMany({
        where: {
          name: { contains: 'Delete User' },
        },
      });

      expect(result.count).toBe(2);

      const remainingUsers = await service.user.findMany();

      expect(remainingUsers).toHaveLength(1);
      expect(remainingUsers[0].name).toBe('Keep User');
      expect(remainingUsers[0]).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
    });
  });
});
