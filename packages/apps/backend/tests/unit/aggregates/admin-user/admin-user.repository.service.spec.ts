import { Test, TestingModule } from '@nestjs/testing';

import { Prisma } from '@/generated/prisma';
import { AdminUserRepositoryService } from '@/aggregates/admin-user/admin-user.repository.service';
import { RepositoryService } from '@/repository/repository.service';
import { AdminUserFactory } from '@/tests/factory';

describe('adminUserRepositoryService', () => {
  let service: AdminUserRepositoryService;
  let adminUserModel: any;
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    adminUserModel = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createManyAndReturn: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      updateManyAndReturn: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    };

    const mockRepository = {
      adminUser: adminUserModel,
    } as unknown as jest.Mocked<RepositoryService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserRepositoryService,
        {
          provide: RepositoryService,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AdminUserRepositoryService>(AdminUserRepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUniqueAdminUser', () => {
    it('should find admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      adminUserModel.findUnique.mockResolvedValue(mockAdminUser);
      const params = { publicId: mockAdminUser.publicId };

      const result = await service.findUniqueAdminUser(params);

      expect(adminUserModel.findUnique).toHaveBeenCalledWith({
        where: params,
      });
      expect(result).toStrictEqual(mockAdminUser);
    });

    it('should return null when admin user not found', async () => {
      expect.assertions(2);

      adminUserModel.findUnique.mockResolvedValue(null);
      const params = { publicId: 'non-existent-publicId' };

      const result = await service.findUniqueAdminUser(params);

      expect(adminUserModel.findUnique).toHaveBeenCalledWith({
        where: params,
      });
      expect(result).toBeNull();
    });
  });

  describe('findManyAdminUsers', () => {
    it('should find many admin users with pagination', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const mockAdminUsers = [mockAdminUser];
      adminUserModel.findMany.mockResolvedValue(mockAdminUsers);
      const params = {
        skip: 10,
        take: 20,
        where: { email: { contains: 'test' } },
        orderBy: { createdAt: Prisma.SortOrder.desc },
      };

      const result = await service.findManyAdminUsers(params);

      expect(adminUserModel.findMany).toHaveBeenCalledWith(params);
      expect(result).toStrictEqual(mockAdminUsers);
    });
  });

  describe('createAdminUser', () => {
    it('should create a new admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      adminUserModel.create.mockResolvedValue(mockAdminUser);
      const params = {
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: mockAdminUser.role,
      };

      const result = await service.createAdminUser(params);

      expect(adminUserModel.create).toHaveBeenCalledWith({
        data: params,
      });
      expect(result).toStrictEqual(mockAdminUser);
    });
  });

  describe('createManyAndReturnAdminUsers', () => {
    it('should create many admin users and return them', async () => {
      expect.assertions(2);

      const mockAdminUser1 = adminUserFactory.build();
      const mockAdminUser2 = adminUserFactory.build();
      const params = [
        { email: mockAdminUser1.email, name: mockAdminUser1.name, role: mockAdminUser1.role },
        { email: mockAdminUser2.email, name: mockAdminUser2.name, role: mockAdminUser2.role },
      ];
      const mockAdminUsers = [mockAdminUser1, mockAdminUser2];
      adminUserModel.createManyAndReturn.mockResolvedValue(mockAdminUsers);

      const result = await service.createManyAndReturnAdminUsers(params);

      expect(adminUserModel.createManyAndReturn).toHaveBeenCalledWith({
        data: params,
      });
      expect(result).toStrictEqual(mockAdminUsers);
    });
  });

  describe('updateAdminUser', () => {
    it('should update an admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const updatedAdminUser = { ...mockAdminUser, name: 'Updated Admin Name' };
      adminUserModel.update.mockResolvedValue(updatedAdminUser);
      const params = {
        where: { publicId: mockAdminUser.publicId },
        data: { name: 'Updated Admin Name' },
      };

      const result = await service.updateAdminUser(params);

      expect(adminUserModel.update).toHaveBeenCalledWith(params);
      expect(result).toStrictEqual(updatedAdminUser);
    });
  });

  describe('deleteAdminUser', () => {
    it('should delete an admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      adminUserModel.delete.mockResolvedValue(mockAdminUser);
      const params = { publicId: mockAdminUser.publicId };

      await service.deleteAdminUser(params);

      expect(adminUserModel.delete).toHaveBeenCalledWith({
        where: params,
      });
      expect(adminUserModel.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteManyAdminUsers', () => {
    it('should delete many admin users', async () => {
      expect.assertions(2);

      adminUserModel.deleteMany.mockResolvedValue({ count: 2 });
      const params = { email: { contains: 'test' } };

      await service.deleteManyAdminUsers(params);

      expect(adminUserModel.deleteMany).toHaveBeenCalledWith({
        where: params,
      });
      expect(adminUserModel.deleteMany).toHaveBeenCalledTimes(1);
    });
  });
});
