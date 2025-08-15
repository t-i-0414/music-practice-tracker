import { createIntegrationTestHelper, IntegrationTestHelper } from '../../../helpers';

import { AdminRole, AdminStatus } from '@/generated/prisma';
import { AdminUserRepositoryService } from '@/modules/aggregate/admin-user/admin-user.repository.service';

describe('adminUserRepositoryService Integration', () => {
  let helper: IntegrationTestHelper;
  let service: AdminUserRepositoryService;

  beforeAll(async () => {
    helper = createIntegrationTestHelper();
    const { module } = await helper.setup([], [AdminUserRepositoryService]);
    service = module.get<AdminUserRepositoryService>(AdminUserRepositoryService);
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  describe('createAdminUser', () => {
    it('should create a new admin user in the database', async () => {
      expect.assertions(2);

      const adminUserData = {
        name: 'Integration Test Admin',
        email: 'admin-integration@test.com',
        role: AdminRole.VIEWER,
      };

      const createdAdminUser = await service.createAdminUser(adminUserData);

      expect(createdAdminUser).toStrictEqual({
        id: expect.any(Number),
        publicId: expect.any(String),
        name: adminUserData.name,
        email: adminUserData.email,
        role: AdminRole.VIEWER,
        status: AdminStatus.PENDING,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const foundAdminUser = await service.findUniqueAdminUser({ publicId: createdAdminUser.publicId });

      expect(foundAdminUser).toStrictEqual(createdAdminUser);
    });
  });

  describe('findUniqueAdminUser', () => {
    it('should find an admin user by publicId', async () => {
      expect.assertions(1);

      const adminUserData = {
        name: 'Find Test Admin',
        email: 'find-admin@test.com',
        role: AdminRole.EDITOR,
      };
      const createdAdminUser = await service.createAdminUser(adminUserData);

      const foundAdminUser = await service.findUniqueAdminUser({ publicId: createdAdminUser.publicId });

      expect(foundAdminUser).toStrictEqual(createdAdminUser);
    });

    it('should return null for non-existent admin user', async () => {
      expect.assertions(1);

      const foundAdminUser = await service.findUniqueAdminUser({ publicId: '00000000-0000-0000-0000-000000000000' });

      expect(foundAdminUser).toBeNull();
    });

    it('should not find deleted admin users', async () => {
      expect.assertions(1);

      const adminUserData = {
        name: 'Delete Test Admin',
        email: 'delete-admin@test.com',
        role: AdminRole.VIEWER,
      };
      const createdAdminUser = await service.createAdminUser(adminUserData);

      await service.deleteAdminUser({ publicId: createdAdminUser.publicId });

      const foundAdminUser = await service.findUniqueAdminUser({ publicId: createdAdminUser.publicId });

      expect(foundAdminUser).toBeNull();
    });
  });

  describe('updateAdminUser', () => {
    it('should update admin user data', async () => {
      expect.assertions(2);

      const adminUserData = {
        name: 'Original Admin Name',
        email: 'original-admin@test.com',
        role: AdminRole.VIEWER,
      };
      const createdAdminUser = await service.createAdminUser(adminUserData);

      const updatedAdminUser = await service.updateAdminUser({
        where: { publicId: createdAdminUser.publicId },
        data: {
          name: 'Updated Admin Name',
          role: AdminRole.ADMIN,
          status: AdminStatus.ACTIVE,
        },
      });

      expect(updatedAdminUser).toMatchObject({
        publicId: createdAdminUser.publicId,
        name: 'Updated Admin Name',
        email: adminUserData.email,
        role: AdminRole.ADMIN,
        status: AdminStatus.ACTIVE,
      });

      const foundAdminUser = await service.findUniqueAdminUser({ publicId: createdAdminUser.publicId });

      expect(foundAdminUser).toStrictEqual(updatedAdminUser);
    });
  });

  describe('deleteAdminUser', () => {
    it('should delete an admin user from the database', async () => {
      expect.assertions(2);

      const adminUserData = {
        name: 'To Delete Admin',
        email: 'to-delete-admin@test.com',
        role: AdminRole.VIEWER,
      };
      const createdAdminUser = await service.createAdminUser(adminUserData);

      await service.deleteAdminUser({ publicId: createdAdminUser.publicId });

      const foundAdminUser = await service.findUniqueAdminUser({ publicId: createdAdminUser.publicId });

      expect(foundAdminUser).toBeNull();

      const allAdminUsers = await service.findManyAdminUsers({});

      expect(allAdminUsers).not.toContainEqual(expect.objectContaining({ publicId: createdAdminUser.publicId }));
    });
  });

  describe('findManyAdminUsers', () => {
    it('should find multiple admin users with filters', async () => {
      expect.assertions(3);

      const _adminUsers = await Promise.all([
        service.createAdminUser({
          name: 'Admin User 1',
          email: 'admin1@test.com',
          role: AdminRole.ADMIN,
        }),
        service.createAdminUser({
          name: 'Admin User 2',
          email: 'admin2@test.com',
          role: AdminRole.VIEWER,
        }),
        service.createAdminUser({
          name: 'Admin User 3',
          email: 'admin3@test.com',
          role: AdminRole.ADMIN,
        }),
      ]);

      const adminRoleUsers = await service.findManyAdminUsers({
        where: { role: AdminRole.ADMIN },
      });

      expect(adminRoleUsers).toHaveLength(2);
      expect(adminRoleUsers).toContainEqual(expect.objectContaining({ email: 'admin1@test.com' }));
      expect(adminRoleUsers).toContainEqual(expect.objectContaining({ email: 'admin3@test.com' }));
    });

    it('should support pagination', async () => {
      expect.assertions(4);

      const _adminUsers = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          service.createAdminUser({
            name: `Paginated Admin ${i}`,
            email: `paginated-admin${i}@test.com`,
            role: AdminRole.VIEWER,
          }),
        ),
      );

      const firstPage = await service.findManyAdminUsers({
        skip: 0,
        take: 2,
        orderBy: { email: 'asc' },
      });

      expect(firstPage).toHaveLength(2);
      expect(firstPage[0].email).toBe('paginated-admin0@test.com');

      const secondPage = await service.findManyAdminUsers({
        skip: 2,
        take: 2,
        orderBy: { email: 'asc' },
      });

      expect(secondPage).toHaveLength(2);
      expect(secondPage[0].email).toBe('paginated-admin2@test.com');
    });
  });
});
