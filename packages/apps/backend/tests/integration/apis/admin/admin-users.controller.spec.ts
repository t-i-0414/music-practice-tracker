import { setupAdminAdminUsersControllerIntegration } from '../helpers/api-integration.helper';

import { AdminApiAdminUsersController } from '@/apis/admin/admin-users/admin-users.controller';
import { AdminRole } from '@/generated/prisma';
import { DatabaseHelper } from '@/tests/helpers/database.helper';


describe('integration AdminApiAdminUsersController', () => {
  let controller: AdminApiAdminUsersController;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const { controller: ctrl } = await setupAdminAdminUsersControllerIntegration(databaseHelper);
    controller = ctrl;
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('post /admin/admin-users', () => {
    it('should create an admin user and return response', async () => {
      expect.assertions(4);

      const createDto = {
        email: 'admin@example.com',
        name: 'Test Admin',
        role: AdminRole.ADMIN,
      };

      const result = await controller.createAdminUser(createDto);

      expect(result.email).toBe(createDto.email);
      expect(result.name).toBe(createDto.name);
      expect(result.role).toBe(createDto.role);
      expect(result.publicId).toBeDefined();
    });
  });

  describe('post /admin/admin-users/bulk', () => {
    it('should create multiple admin users', async () => {
      expect.assertions(3);

      const createDto = {
        adminUsers: [
          {
            email: 'admin1@example.com',
            name: 'Admin 1',
            role: AdminRole.VIEWER,
          },
          {
            email: 'admin2@example.com',
            name: 'Admin 2',
            role: AdminRole.ADMIN,
          },
        ],
      };

      const result = await controller.createManyAdminUsers(createDto);

      expect(result.adminUsers).toHaveLength(2);
      expect(result.adminUsers[0].email).toBe('admin1@example.com');
      expect(result.adminUsers[1].email).toBe('admin2@example.com');
    });
  });

  describe('get /admin/admin-users', () => {
    it('should return all admin users when no publicIds provided', async () => {
      expect.assertions(2);

      await controller.createAdminUser({
        email: 'admin1@example.com',
        name: 'Admin 1',
        role: AdminRole.ADMIN,
      });

      await controller.createAdminUser({
        email: 'admin2@example.com',
        name: 'Admin 2',
        role: AdminRole.VIEWER,
      });

      const result = await controller.findManyAdminUsers(undefined);

      expect(result.adminUsers).toHaveLength(2);

      const emails = result.adminUsers.map((u) => u.email).sort();

      expect(emails).toStrictEqual(['admin1@example.com', 'admin2@example.com']);
    });

    it('should return specific admin users by publicIds', async () => {
      expect.assertions(2);

      const admin1 = await controller.createAdminUser({
        email: 'admin1@example.com',
        name: 'Admin 1',
        role: AdminRole.ADMIN,
      });

      await controller.createAdminUser({
        email: 'admin2@example.com',
        name: 'Admin 2',
        role: AdminRole.VIEWER,
      });

      const admin3 = await controller.createAdminUser({
        email: 'admin3@example.com',
        name: 'Admin 3',
        role: AdminRole.ADMIN,
      });

      const result = await controller.findManyAdminUsers([admin1.publicId, admin3.publicId]);

      expect(result.adminUsers).toHaveLength(2);
      expect(result.adminUsers.map((u) => u.publicId).sort()).toStrictEqual([admin1.publicId, admin3.publicId].sort());
    });
  });

  describe('get /admin/admin-users/:publicId', () => {
    it('should return a specific admin user by publicId', async () => {
      expect.assertions(3);

      const created = await controller.createAdminUser({
        email: 'admin@example.com',
        name: 'Test Admin',
        role: AdminRole.ADMIN,
      });

      const result = await controller.findAdminUserById(created.publicId);

      expect(result.publicId).toBe(created.publicId);
      expect(result.email).toBe('admin@example.com');
      expect(result.name).toBe('Test Admin');
    });
  });

  describe('put /admin/admin-users/:publicId', () => {
    it('should update an admin user', async () => {
      expect.assertions(4);

      const created = await controller.createAdminUser({
        email: 'admin@example.com',
        name: 'Original Name',
        role: AdminRole.VIEWER,
      });

      const updateData = {
        name: 'Updated Name',
        role: AdminRole.ADMIN,
      };

      const result = await controller.updateAdminUser(created.publicId, updateData);

      expect(result.publicId).toBe(created.publicId);
      expect(result.email).toBe('admin@example.com');
      expect(result.name).toBe('Updated Name');
      expect(result.role).toBe(AdminRole.ADMIN);
    });
  });

  describe('delete /admin/admin-users/:publicId', () => {
    it('should delete an admin user', async () => {
      expect.assertions(1);

      const created = await controller.createAdminUser({
        email: 'admin@example.com',
        name: 'To Delete',
        role: AdminRole.ADMIN,
      });

      await controller.deleteAdminUser(created.publicId);

      await expect(controller.findAdminUserById(created.publicId)).rejects.toThrow('No record was found');
    });
  });

  describe('delete /admin/admin-users', () => {
    it('should delete multiple admin users', async () => {
      expect.assertions(1);

      const admin1 = await controller.createAdminUser({
        email: 'admin1@example.com',
        name: 'Admin 1',
        role: AdminRole.ADMIN,
      });

      const admin2 = await controller.createAdminUser({
        email: 'admin2@example.com',
        name: 'Admin 2',
        role: AdminRole.VIEWER,
      });

      await controller.createAdminUser({
        email: 'admin3@example.com',
        name: 'Admin 3',
        role: AdminRole.ADMIN,
      });

      await controller.deleteManyAdminUsers({ publicIds: [admin1.publicId, admin2.publicId] });

      const remaining = await controller.findManyAdminUsers(undefined);

      expect(remaining.adminUsers).toHaveLength(1);
    });
  });
});
