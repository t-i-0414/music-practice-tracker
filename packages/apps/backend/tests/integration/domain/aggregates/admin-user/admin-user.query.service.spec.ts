import { setupAdminUserQueryServiceIntegration } from '../../helpers/domain-integration.helper';

import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
import { AdminRole } from '@/generated/prisma';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration AdminUserQueryService', () => {
  let service: AdminUserQueryService;
  let databaseHelper: DatabaseHelper;
  let repository: any;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const { service: svc } = await setupAdminUserQueryServiceIntegration(databaseHelper);
    service = svc;
    repository = databaseHelper.client;
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('findUniqueOrThrowAdminUser', () => {
    it('should find an admin user by publicId', async () => {
      expect.assertions(3);

      const created = await repository.adminUser.create({
        data: {
          cognitoSub: 'sub-find',
          name: 'Find Me',
          role: AdminRole.ADMIN,
        },
      });

      const result = await service.findUniqueOrThrowAdminUser({ publicId: created.publicId });

      expect(result.cognitoSub).toBe('sub-find');
      expect(result.name).toBe('Find Me');
      expect(result.role).toBe(AdminRole.ADMIN);
    });

    it('should throw NotFoundException for non-existent admin user', async () => {
      expect.assertions(1);

      await expect(
        service.findUniqueOrThrowAdminUser({ publicId: '00000000-0000-0000-0000-000000000000' }),
      ).rejects.toThrow('No record was found for a query');
    });
  });

  describe('findManyAdminUsersById', () => {
    it('should find multiple admin users by publicIds', async () => {
      expect.assertions(4);

      const admin1 = await repository.adminUser.create({
        data: {
          cognitoSub: 'sub-admin1',
          name: 'Admin 1',
          role: AdminRole.VIEWER,
        },
      });

      const admin2 = await repository.adminUser.create({
        data: {
          cognitoSub: 'sub-admin2',
          name: 'Admin 2',
          role: AdminRole.ADMIN,
        },
      });

      await repository.adminUser.create({
        data: {
          cognitoSub: 'sub-admin3',
          name: 'Admin 3',
          role: AdminRole.SUPER_ADMIN,
        },
      });

      const result = await service.findManyAdminUsersById({
        publicIds: [admin1.publicId, admin2.publicId],
      });

      expect(result.adminUsers).toHaveLength(2);
      expect(result.adminUsers.some((u) => u.name === 'Admin 1')).toBe(true);
      expect(result.adminUsers.some((u) => u.name === 'Admin 2')).toBe(true);
      expect(result.adminUsers.some((u) => u.name === 'Admin 3')).toBe(false);
    });

    it('should return empty array for non-existent publicIds', async () => {
      expect.assertions(1);

      const result = await service.findManyAdminUsersById({
        publicIds: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'],
      });

      expect(result.adminUsers).toHaveLength(0);
    });

    it('should handle mixed existent and non-existent publicIds', async () => {
      expect.assertions(2);

      const admin = await repository.adminUser.create({
        data: {
          cognitoSub: 'sub-exists',
          name: 'Exists',
          role: AdminRole.ADMIN,
        },
      });

      const result = await service.findManyAdminUsersById({
        publicIds: [admin.publicId, '00000000-0000-0000-0000-000000000000'],
      });

      expect(result.adminUsers).toHaveLength(1);
      expect(result.adminUsers[0].name).toBe('Exists');
    });

    it('should handle empty publicIds array', async () => {
      expect.assertions(1);

      const result = await service.findManyAdminUsersById({ publicIds: [] });

      expect(result.adminUsers).toHaveLength(0);
    });
  });

  describe('findAllAdminUsers', () => {
    it('should return all admin users ordered by createdAt desc', async () => {
      expect.assertions(4);

      await repository.adminUser.create({
        data: {
          cognitoSub: 'sub-first',
          name: 'First Admin',
          role: AdminRole.VIEWER,
        },
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      await repository.adminUser.create({
        data: {
          cognitoSub: 'sub-second',
          name: 'Second Admin',
          role: AdminRole.ADMIN,
        },
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      await repository.adminUser.create({
        data: {
          cognitoSub: 'sub-third',
          name: 'Third Admin',
          role: AdminRole.SUPER_ADMIN,
        },
      });

      const result = await service.findAllAdminUsers();

      expect(result.adminUsers).toHaveLength(3);
      expect(result.adminUsers[0].name).toBe('Third Admin');
      expect(result.adminUsers[1].name).toBe('Second Admin');
      expect(result.adminUsers[2].name).toBe('First Admin');
    });

    it('should return empty array when no admin users exist', async () => {
      expect.assertions(1);

      const result = await service.findAllAdminUsers();

      expect(result.adminUsers).toHaveLength(0);
    });
  });

  describe('findManyAdminUsersByFilter', () => {
    beforeEach(async () => {
      await repository.adminUser.createMany({
        data: [
          { cognitoSub: 'sub-viewer1', name: 'Viewer 1', role: AdminRole.VIEWER },
          { cognitoSub: 'sub-viewer2', name: 'Viewer 2', role: AdminRole.VIEWER },
          { cognitoSub: 'sub-admin1', name: 'Admin 1', role: AdminRole.ADMIN },
          { cognitoSub: 'sub-admin2', name: 'Admin 2', role: AdminRole.ADMIN },
          { cognitoSub: 'sub-super1', name: 'Super 1', role: AdminRole.SUPER_ADMIN },
        ],
      });
    });

    it('should filter admin users by role', async () => {
      expect.assertions(3);

      const viewers = await service.findManyAdminUsersByFilter({
        where: { role: AdminRole.VIEWER },
      });

      expect(viewers).toHaveLength(2);
      expect(viewers.every((u) => u.role === AdminRole.VIEWER)).toBe(true);

      const admins = await service.findManyAdminUsersByFilter({
        where: { role: AdminRole.ADMIN },
      });

      expect(admins).toHaveLength(2);
    });

    it('should filter admin users by name pattern', async () => {
      expect.assertions(2);

      const result = await service.findManyAdminUsersByFilter({
        where: {
          name: { contains: 'Admin' },
        },
      });

      expect(result).toHaveLength(2);
      expect(result.every((u) => u.name.includes('Admin'))).toBe(true);
    });

    it('should apply pagination with skip and take', async () => {
      expect.assertions(3);

      const firstPage = await service.findManyAdminUsersByFilter({
        skip: 0,
        take: 2,
        orderBy: { name: 'asc' },
      });

      expect(firstPage).toHaveLength(2);

      const secondPage = await service.findManyAdminUsersByFilter({
        skip: 2,
        take: 2,
        orderBy: { name: 'asc' },
      });

      expect(secondPage).toHaveLength(2);

      const thirdPage = await service.findManyAdminUsersByFilter({
        skip: 4,
        take: 2,
        orderBy: { name: 'asc' },
      });

      expect(thirdPage).toHaveLength(1);
    });

    it('should order admin users by name', async () => {
      expect.assertions(3);

      const result = await service.findManyAdminUsersByFilter({
        orderBy: { name: 'asc' },
      });

      expect(result[0].name).toBe('Admin 1');
      expect(result[1].name).toBe('Admin 2');
      expect(result[result.length - 1].name).toBe('Viewer 2');
    });

    it('should combine multiple filters', async () => {
      expect.assertions(2);

      const result = await service.findManyAdminUsersByFilter({
        where: {
          AND: [{ role: { not: AdminRole.SUPER_ADMIN } }, { name: { contains: 'Viewer' } }],
        },
        orderBy: { name: 'desc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Viewer 2');
    });

    it('should handle cursor-based pagination', async () => {
      expect.assertions(3);

      await service.findManyAdminUsersByFilter({
        orderBy: { name: 'asc' },
      });

      const firstBatch = await service.findManyAdminUsersByFilter({
        take: 2,
        orderBy: { name: 'asc' },
      });

      expect(firstBatch).toHaveLength(2);

      const secondBatch = await service.findManyAdminUsersByFilter({
        take: 2,
        cursor: { publicId: firstBatch[1].publicId },
        skip: 1,
        orderBy: { name: 'asc' },
      });

      expect(secondBatch).toHaveLength(2);
      expect(secondBatch[0].name).not.toBe(firstBatch[1].name);
    });
  });
});
