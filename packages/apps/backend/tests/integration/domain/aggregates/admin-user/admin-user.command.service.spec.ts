import { Test, TestingModule } from '@nestjs/testing';

import { AdminUserCommandService } from '@/domain/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
import { AdminRole } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('adminUserCommandService (Integration)', () => {
  let service: AdminUserCommandService;
  let queryService: AdminUserQueryService;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserCommandService,
        AdminUserQueryService,
        {
          provide: RepositoryService,
          useValue: databaseHelper.client,
        },
      ],
    }).compile();

    service = module.get<AdminUserCommandService>(AdminUserCommandService);
    queryService = module.get<AdminUserQueryService>(AdminUserQueryService);
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('createAdminUser', () => {
    it('should create an admin user in the database', async () => {
      expect.assertions(3);

      const createDto = {
        email: 'admin@example.com',
        name: 'Admin User',
        role: AdminRole.ADMIN,
      };

      const result = await service.createAdminUser(createDto);

      expect(result).toMatchObject({
        email: createDto.email,
        name: createDto.name,
        role: createDto.role,
      });
      expect(result.publicId).toBeDefined();

      const foundAdminUser = await queryService.findUniqueOrThrowAdminUser({ publicId: result.publicId });

      expect(foundAdminUser).toMatchObject({
        email: createDto.email,
        name: createDto.name,
        role: createDto.role,
      });
    });

    it('should throw error for duplicate email', async () => {
      expect.assertions(1);

      const createDto = {
        email: 'duplicate@example.com',
        name: 'Admin 1',
        role: AdminRole.VIEWER,
      };

      await service.createAdminUser(createDto);

      await expect(
        service.createAdminUser({
          email: createDto.email,
          name: 'Admin 2',
          role: AdminRole.ADMIN,
        }),
      ).rejects.toThrow('Unique constraint failed');
    });

    it('should create admin users with different roles', async () => {
      expect.assertions(6);

      const viewerDto = {
        email: 'viewer@example.com',
        name: 'Viewer Admin',
        role: AdminRole.VIEWER,
      };

      const adminDto = {
        email: 'admin@example.com',
        name: 'Admin Admin',
        role: AdminRole.ADMIN,
      };

      const superAdminDto = {
        email: 'super@example.com',
        name: 'Super Admin',
        role: AdminRole.SUPER_ADMIN,
      };

      const viewer = await service.createAdminUser(viewerDto);
      const admin = await service.createAdminUser(adminDto);
      const superAdmin = await service.createAdminUser(superAdminDto);

      expect(viewer.role).toBe(AdminRole.VIEWER);
      expect(admin.role).toBe(AdminRole.ADMIN);
      expect(superAdmin.role).toBe(AdminRole.SUPER_ADMIN);

      const foundViewer = await queryService.findUniqueOrThrowAdminUser({ publicId: viewer.publicId });
      const foundAdmin = await queryService.findUniqueOrThrowAdminUser({ publicId: admin.publicId });
      const foundSuper = await queryService.findUniqueOrThrowAdminUser({ publicId: superAdmin.publicId });

      expect(foundViewer.role).toBe(AdminRole.VIEWER);
      expect(foundAdmin.role).toBe(AdminRole.ADMIN);
      expect(foundSuper.role).toBe(AdminRole.SUPER_ADMIN);
    });
  });

  describe('updateAdminUserById', () => {
    it('should update an admin user in the database', async () => {
      expect.assertions(4);

      const createDto = {
        email: 'update@example.com',
        name: 'Original Name',
        role: AdminRole.VIEWER,
      };

      const created = await service.createAdminUser(createDto);
      const updateData = {
        name: 'Updated Name',
        role: AdminRole.ADMIN,
      };

      const result = await service.updateAdminUserById({
        publicId: created.publicId,
        data: updateData,
      });

      expect(result.name).toBe(updateData.name);
      expect(result.role).toBe(updateData.role);
      expect(result.email).toBe(createDto.email);

      const foundAdminUser = await queryService.findUniqueOrThrowAdminUser({ publicId: created.publicId });

      expect(foundAdminUser.name).toBe(updateData.name);
    });

    it('should throw error for non-existent admin user', async () => {
      expect.assertions(1);

      await expect(
        service.updateAdminUserById({
          publicId: '00000000-0000-0000-0000-000000000000',
          data: { name: 'New Name' },
        }),
      ).rejects.toThrow('No record was found for an update');
    });

    it('should update only specified fields', async () => {
      expect.assertions(3);

      const createDto = {
        email: 'partial@example.com',
        name: 'Original Name',
        role: AdminRole.VIEWER,
      };

      const created = await service.createAdminUser(createDto);

      const result = await service.updateAdminUserById({
        publicId: created.publicId,
        data: { name: 'Updated Name' },
      });

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe(createDto.email);
      expect(result.role).toBe(createDto.role);
    });
  });

  describe('deleteAdminUserById', () => {
    it('should delete an admin user from the database', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'delete@example.com',
        name: 'Delete Me',
        role: AdminRole.VIEWER,
      };

      const created = await service.createAdminUser(createDto);

      expect(created.email).toBe(createDto.email);

      await service.deleteAdminUserById({ publicId: created.publicId });

      await expect(queryService.findUniqueOrThrowAdminUser({ publicId: created.publicId })).rejects.toThrow(
        'No record was found for a query',
      );
    });

    it('should throw error for non-existent admin user', async () => {
      expect.assertions(1);

      await expect(
        service.deleteAdminUserById({
          publicId: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toThrow('No record was found for a delete');
    });
  });

  describe('createManyAndReturnAdminUsers', () => {
    it('should create multiple admin users in the database', async () => {
      expect.assertions(6);

      const createDto = {
        adminUsers: [
          { email: 'admin1@example.com', name: 'Admin 1', role: AdminRole.VIEWER },
          { email: 'admin2@example.com', name: 'Admin 2', role: AdminRole.ADMIN },
          { email: 'admin3@example.com', name: 'Admin 3', role: AdminRole.SUPER_ADMIN },
        ],
      };

      const result = await service.createManyAndReturnAdminUsers(createDto);

      expect(result.adminUsers).toHaveLength(3);
      expect(result.adminUsers[0].email).toBe('admin1@example.com');
      expect(result.adminUsers[1].email).toBe('admin2@example.com');
      expect(result.adminUsers[2].email).toBe('admin3@example.com');

      const allAdminUsers = await queryService.findManyAdminUsersById({
        publicIds: result.adminUsers.map((u) => u.publicId),
      });

      expect(allAdminUsers.adminUsers).toHaveLength(3);
      expect(allAdminUsers.adminUsers.some((u) => u.role === AdminRole.SUPER_ADMIN)).toBe(true);
    });

    it('should handle empty array', async () => {
      expect.assertions(1);

      const result = await service.createManyAndReturnAdminUsers({ adminUsers: [] });

      expect(result.adminUsers).toHaveLength(0);
    });
  });

  describe('deleteManyAdminUsersByIds', () => {
    it('should delete multiple admin users from the database', async () => {
      expect.assertions(1);

      const adminUsers = await service.createManyAndReturnAdminUsers({
        adminUsers: [
          { email: 'del1@example.com', name: 'Delete 1', role: AdminRole.VIEWER },
          { email: 'del2@example.com', name: 'Delete 2', role: AdminRole.ADMIN },
          { email: 'keep@example.com', name: 'Keep Me', role: AdminRole.ADMIN },
        ],
      });

      const publicIdsToDelete = [adminUsers.adminUsers[0].publicId, adminUsers.adminUsers[1].publicId];
      await service.deleteManyAdminUsersByIds({ publicIds: publicIdsToDelete });

      const remainingUser = await queryService.findUniqueOrThrowAdminUser({
        publicId: adminUsers.adminUsers[2].publicId,
      });

      expect(remainingUser.email).toBe('keep@example.com');
    });

    it('should handle empty array', async () => {
      expect.assertions(1);

      await service.deleteManyAdminUsersByIds({ publicIds: [] });

      const allAdminUsers = await queryService.findAllAdminUsers();

      expect(allAdminUsers.adminUsers).toHaveLength(0);
    });

    it('should ignore non-existent IDs', async () => {
      expect.assertions(2);

      const adminUser = await service.createAdminUser({
        email: 'keep@example.com',
        name: 'Keep Me',
        role: AdminRole.ADMIN,
      });

      await service.deleteManyAdminUsersByIds({
        publicIds: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'],
      });

      const foundUser = await queryService.findUniqueOrThrowAdminUser({ publicId: adminUser.publicId });

      expect(foundUser.email).toBe('keep@example.com');
      expect(foundUser.publicId).toBe(adminUser.publicId);
    });
  });
});
