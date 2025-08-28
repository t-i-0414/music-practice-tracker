import { Test, TestingModule } from '@nestjs/testing';

import { AdminUserCommandService } from '@/aggregates/admin-user/command.service';
import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/aggregates/admin-user/dto';
import { AdminUserQueryService } from '@/aggregates/admin-user/query.service';
import { AdminRole } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';
import { AdminUserFactory } from '@/tests/factory';

describe('adminUserCommandService', () => {
  let service: AdminUserCommandService;
  let repository: {
    adminUser: {
      create: jest.Mock;
      createManyAndReturn: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let queryService: jest.Mocked<AdminUserQueryService>;
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockRepository = {
      adminUser: {
        create: jest.fn(),
        createManyAndReturn: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const mockQueryService = {
      findUniqueOrThrowAdminUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserCommandService,
        {
          provide: RepositoryService,
          useValue: mockRepository,
        },
        {
          provide: AdminUserQueryService,
          useValue: mockQueryService,
        },
      ],
    }).compile();

    service = module.get<AdminUserCommandService>(AdminUserCommandService);
    repository = module.get(RepositoryService);
    queryService = module.get(AdminUserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdminUser', () => {
    it('should create a new admin user and return response DTO', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      repository.adminUser.create.mockResolvedValue(mockAdminUser);
      const params = {
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: AdminRole.VIEWER,
      };

      const result = await service.createAdminUser(params);

      expect(repository.adminUser.create).toHaveBeenCalledWith({
        data: params,
      });
      expect(result).toStrictEqual(toAdminUserResponseDto(mockAdminUser));
    });
  });

  describe('createManyAndReturnAdminUsers', () => {
    it('should create multiple admin users and return response DTO', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      repository.adminUser.createManyAndReturn.mockResolvedValue(mockAdminUsers);
      const params = {
        adminUsers: mockAdminUsers.map((user) => ({
          email: user.email,
          name: user.name,
          role: user.role,
        })),
      };

      const result = await service.createManyAndReturnAdminUsers(params);

      expect(repository.adminUser.createManyAndReturn).toHaveBeenCalledWith({
        data: params.adminUsers,
      });
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });
  });

  describe('updateAdminUserById', () => {
    it('should verify admin user exists and update it', async () => {
      expect.assertions(3);

      const mockAdminUser = adminUserFactory.build();
      const updatedAdminUser = {
        ...mockAdminUser,
        name: 'Updated Admin Name',
        role: AdminRole.ADMIN,
      };
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(mockResponseDto);
      repository.adminUser.update.mockResolvedValue(updatedAdminUser);

      const params = {
        publicId: mockAdminUser.publicId,
        data: {
          name: 'Updated Admin Name',
          role: AdminRole.ADMIN,
        },
      };

      const result = await service.updateAdminUserById(params);

      expect(queryService.findUniqueOrThrowAdminUser).toHaveBeenCalledWith({ publicId: params.publicId });
      expect(repository.adminUser.update).toHaveBeenCalledWith({
        where: { publicId: params.publicId },
        data: params.data,
      });
      expect(result).toStrictEqual(toAdminUserResponseDto(updatedAdminUser));
    });

    it('should throw error if admin user does not exist', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      const error = new Error('AdminUser not found');
      queryService.findUniqueOrThrowAdminUser.mockRejectedValue(error);

      const params = {
        publicId,
        data: { name: 'Updated Name' },
      };

      await expect(service.updateAdminUserById(params)).rejects.toThrow(error);
      expect(repository.adminUser.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteAdminUserById', () => {
    it('should verify admin user exists and delete it', async () => {
      expect.assertions(3);

      const mockAdminUser = adminUserFactory.build();
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(mockResponseDto);
      repository.adminUser.delete.mockResolvedValue(undefined);

      const params = { publicId: mockAdminUser.publicId };

      await service.deleteAdminUserById(params);

      expect(queryService.findUniqueOrThrowAdminUser).toHaveBeenCalledWith(params);
      expect(repository.adminUser.delete).toHaveBeenCalledWith({
        where: params,
      });
      expect(repository.adminUser.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw error if admin user does not exist', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      const error = new Error('AdminUser not found');
      queryService.findUniqueOrThrowAdminUser.mockRejectedValue(error);

      await expect(service.deleteAdminUserById({ publicId })).rejects.toThrow(error);
      expect(repository.adminUser.delete).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyAdminUsersByIds', () => {
    it('should delete multiple admin users without verification', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2', 'id3'];
      repository.adminUser.deleteMany.mockResolvedValue(undefined);
      const params = { publicIds };

      await service.deleteManyAdminUsersByIds(params);

      expect(repository.adminUser.deleteMany).toHaveBeenCalledWith({
        where: {
          publicId: { in: publicIds },
        },
      });
      expect(queryService.findUniqueOrThrowAdminUser).not.toHaveBeenCalled();
    });

    it('should handle empty array of IDs', async () => {
      expect.assertions(1);

      const publicIds: string[] = [];
      repository.adminUser.deleteMany.mockResolvedValue(undefined);

      await service.deleteManyAdminUsersByIds({ publicIds });

      expect(repository.adminUser.deleteMany).toHaveBeenCalledWith({
        where: {
          publicId: { in: [] },
        },
      });
    });
  });
});
