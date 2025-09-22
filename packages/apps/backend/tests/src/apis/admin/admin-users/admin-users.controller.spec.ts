import { Test } from '@nestjs/testing';

import { AdminApiAdminUsersController } from '@/apis/admin/admin-users/admin-users.controller';
import { AdminUserCommandService } from '@/domain/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
import { AdminRole } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
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

    const module = await Test.createTestingModule({
      controllers: [AdminApiAdminUsersController],
      providers: [
        AdminUserCommandService,
        AdminUserQueryService,
        { provide: RepositoryService, useValue: databaseHelper.client },
      ],
    }).compile();

    controller = module.get<AdminApiAdminUsersController>(AdminApiAdminUsersController);
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('get /admin/admin-users', () => {
    it('should return specific admin users by publicIds', async () => {
      expect.assertions(2);

      const admin1 = await controller.createAdminUser({
        cognitoSub: 'sub-admin1',
        name: 'Admin 1',
        role: AdminRole.ADMIN,
      });

      await controller.createAdminUser({
        cognitoSub: 'sub-admin2',
        name: 'Admin 2',
        role: AdminRole.VIEWER,
      });

      const admin3 = await controller.createAdminUser({
        cognitoSub: 'sub-admin3',
        name: 'Admin 3',
        role: AdminRole.ADMIN,
      });

      const result = await controller.findManyAdminUsers({ publicIds: [admin1.publicId, admin3.publicId] });

      expect(result.adminUsers).toHaveLength(2);
      expect(result.adminUsers.map((u) => u.publicId).sort((a, b) => a.localeCompare(b))).toStrictEqual(
        [admin1.publicId, admin3.publicId].sort((a, b) => a.localeCompare(b)),
      );
    });
  });

  describe('post /admin/admin-users', () => {
    it('should create an admin user and return response', async () => {
      expect.assertions(4);

      const createDto = {
        cognitoSub: 'sub-admin',
        name: 'Test Admin',
        role: AdminRole.ADMIN,
      };

      const result = await controller.createAdminUser(createDto);

      expect(result.cognitoSub).toBe(createDto.cognitoSub);
      expect(result.name).toBe(createDto.name);
      expect(result.role).toBe(createDto.role);
      expect(result.publicId).toBeDefined();
    });
  });

  describe('delete /admin/admin-users', () => {
    it('should delete multiple admin users', async () => {
      expect.assertions(1);

      const admin1 = await controller.createAdminUser({
        cognitoSub: 'sub-admin1-del',
        name: 'Admin 1',
        role: AdminRole.ADMIN,
      });

      const admin2 = await controller.createAdminUser({
        cognitoSub: 'sub-admin2-del',
        name: 'Admin 2',
        role: AdminRole.VIEWER,
      });

      const admin3 = await controller.createAdminUser({
        cognitoSub: 'sub-admin3-del',
        name: 'Admin 3',
        role: AdminRole.ADMIN,
      });

      await controller.deleteManyAdminUsers({ publicIds: [admin1.publicId, admin2.publicId] });

      const remaining = await controller.findManyAdminUsers({ publicIds: [admin3.publicId] });

      expect(remaining.adminUsers).toHaveLength(1);
    });
  });

  describe('post /admin/admin-users/bulk', () => {
    it('should create multiple admin users', async () => {
      expect.assertions(3);

      const createDto = {
        adminUsers: [
          { cognitoSub: 'sub-admin1', name: 'Admin 1', role: AdminRole.VIEWER },
          { cognitoSub: 'sub-admin2', name: 'Admin 2', role: AdminRole.ADMIN },
        ],
      };

      const result = await controller.createManyAdminUsers(createDto);

      expect(result.adminUsers).toHaveLength(2);
      expect(result.adminUsers[0].cognitoSub).toBe('sub-admin1');
      expect(result.adminUsers[1].cognitoSub).toBe('sub-admin2');
    });
  });

  describe('get /admin/admin-users/:publicId', () => {
    it('should return a specific admin user by publicId', async () => {
      expect.assertions(3);

      const created = await controller.createAdminUser({
        cognitoSub: 'sub-admin',
        name: 'Test Admin',
        role: AdminRole.ADMIN,
      });

      const result = await controller.findAdminUserById(created.publicId);

      expect(result.publicId).toBe(created.publicId);
      expect(result.cognitoSub).toBe('sub-admin');
      expect(result.name).toBe('Test Admin');
    });
  });

  describe('put /admin/admin-users/:publicId', () => {
    it('should update an admin user', async () => {
      expect.assertions(4);

      const created = await controller.createAdminUser({
        cognitoSub: 'sub-admin',
        name: 'Original Name',
        role: AdminRole.VIEWER,
      });

      const updateData = {
        name: 'Updated Name',
        role: AdminRole.ADMIN,
      };

      const result = await controller.updateAdminUser(created.publicId, updateData);

      expect(result.publicId).toBe(created.publicId);
      expect(result.cognitoSub).toBe('sub-admin');
      expect(result.name).toBe('Updated Name');
      expect(result.role).toBe(AdminRole.ADMIN);
    });
  });

  describe('delete /admin/admin-users/:publicId', () => {
    it('should delete an admin user', async () => {
      expect.assertions(1);

      const created = await controller.createAdminUser({
        cognitoSub: 'sub-admin-del',
        name: 'To Delete',
        role: AdminRole.ADMIN,
      });

      await controller.deleteAdminUser(created.publicId);

      await expect(controller.findAdminUserById(created.publicId)).rejects.toThrow('No record was found');
    });
  });
});
