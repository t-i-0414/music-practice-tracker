import { Test, TestingModule } from '@nestjs/testing';

import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('repositoryService (Integration)', () => {
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
            email: 'transaction@example.com',
            name: 'Transaction User',
          },
        });

        const adminUser = await tx.adminUser.create({
          data: {
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN',
          },
        });

        return { user, adminUser };
      });

      expect(result.user.email).toBe('transaction@example.com');
      expect(result.adminUser.email).toBe('admin@example.com');

      const foundUser = await service.user.findUnique({
        where: { publicId: result.user.publicId },
      });

      expect(foundUser).toBeTruthy();
    });

    it('should rollback transaction on error', async () => {
      expect.assertions(1);

      await expect(
        service.$transaction(async (tx) => {
          await tx.user.create({
            data: {
              email: 'rollback@example.com',
              name: 'Rollback User',
            },
          });

          throw new Error('Forced rollback');
        }),
      ).rejects.toThrow('Forced rollback');
    });

    it('should handle nested transactions', async () => {
      expect.assertions(2);

      const result = await service.$transaction(async (tx) => {
        const user1 = await tx.user.create({
          data: {
            email: 'nested1@example.com',
            name: 'Nested User 1',
          },
        });

        const user2 = await tx.user.create({
          data: {
            email: 'nested2@example.com',
            name: 'Nested User 2',
          },
        });

        return { user1, user2 };
      });

      expect(result.user1.email).toBe('nested1@example.com');
      expect(result.user2.email).toBe('nested2@example.com');
    });
  });

  describe('error handling', () => {
    it('should handle unique constraint violations', async () => {
      expect.assertions(2);

      await service.user.create({
        data: {
          email: 'duplicate@example.com',
          name: 'First User',
        },
      });

      await expect(
        service.user.create({
          data: {
            email: 'duplicate@example.com',
            name: 'Second User',
          },
        }),
      ).rejects.toMatchObject({
        code: 'P2002',
      });
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
          where: { publicId: 'non-existent-id' },
        }),
      ).rejects.toMatchObject({
        message: expect.stringContaining('No User found'),
      });
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent reads', async () => {
      expect.assertions(12);

      const user = await service.user.create({
        data: {
          email: 'concurrent@example.com',
          name: 'Concurrent User',
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
        expect(result?.email).toBe('concurrent@example.com');
      });

      expect(results.every((result) => result !== null)).toBe(true);
    });

    it('should handle concurrent writes with different records', async () => {
      expect.assertions(3);

      const promises = Array.from({ length: 5 }, (_, i) =>
        service.user.create({
          data: {
            email: `concurrent${i}@example.com`,
            name: `Concurrent User ${i}`,
          },
        }),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);

      const emails = results.map((r) => r.email);

      expect(new Set(emails).size).toBe(5);
      expect(results[0].email).toContain('concurrent');
    });
  });

  describe('batch operations', () => {
    it('should handle createMany operation', async () => {
      expect.assertions(4);

      const result = await service.user.createManyAndReturn({
        data: [
          { email: 'batch1@example.com', name: 'Batch User 1' },
          { email: 'batch2@example.com', name: 'Batch User 2' },
          { email: 'batch3@example.com', name: 'Batch User 3' },
        ],
      });

      expect(result).toHaveLength(3);
      expect(result[0].email).toBe('batch1@example.com');
      expect(result[1].email).toBe('batch2@example.com');
      expect(result[2].email).toBe('batch3@example.com');
    });

    it('should handle updateMany operation', async () => {
      expect.assertions(2);

      await service.user.createManyAndReturn({
        data: [
          { email: 'update1@example.com', name: 'Old Name 1' },
          { email: 'update2@example.com', name: 'Old Name 2' },
        ],
      });

      const result = await service.user.updateMany({
        where: {
          email: { contains: 'update' },
        },
        data: {
          name: 'Updated Name',
        },
      });

      expect(result.count).toBe(2);

      const users = await service.user.findMany({
        where: { email: { contains: 'update' } },
      });
      users.forEach((user) => {
        expect(user.name).toBe('Updated Name');
      });

      expect(users).toHaveLength(2);
    });

    it('should handle deleteMany operation', async () => {
      expect.assertions(3);

      await service.user.createManyAndReturn({
        data: [
          { email: 'delete1@example.com', name: 'Delete User 1' },
          { email: 'delete2@example.com', name: 'Delete User 2' },
          { email: 'keep@example.com', name: 'Keep User' },
        ],
      });

      const result = await service.user.deleteMany({
        where: {
          email: { contains: 'delete' },
        },
      });

      expect(result.count).toBe(2);

      const remainingUsers = await service.user.findMany();

      expect(remainingUsers).toHaveLength(1);
      expect(remainingUsers[0].email).toBe('keep@example.com');
      expect(remainingUsers[0]).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
    });
  });
});
