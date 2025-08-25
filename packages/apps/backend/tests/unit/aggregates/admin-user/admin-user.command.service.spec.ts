import { Test, TestingModule } from '@nestjs/testing';

import { AdminUserCommandService } from '@/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/aggregates/admin-user/admin-user.query.service';
import { AdminUserRepositoryService } from '@/aggregates/admin-user/admin-user.repository.service';
import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/aggregates/admin-user/admin-user.response.dto';
import { AdminRole } from '@/generated/prisma';
import { AdminUserFactory } from '@/tests/factory';

describe('adminUserCommandService', () => {
  let service: AdminUserCommandService;
  let repository: jest.Mocked<AdminUserRepositoryService>;
  let queryService: jest.Mocked<AdminUserQueryService>;
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockRepository = {
      createAdminUser: jest.fn(),
      createManyAndReturnAdminUsers: jest.fn(),
      updateAdminUser: jest.fn(),
      deleteAdminUser: jest.fn(),
      deleteManyAdminUsers: jest.fn(),
    };

    const mockQueryService = {
      findAdminUserByIdOrFail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserCommandService,
        {
          provide: AdminUserRepositoryService,
          useValue: mockRepository,
        },
        {
          provide: AdminUserQueryService,
          useValue: mockQueryService,
        },
      ],
    }).compile();

    service = module.get<AdminUserCommandService>(AdminUserCommandService);
    repository = module.get(AdminUserRepositoryService);
    queryService = module.get(AdminUserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdminUser', () => {
    it('should create a new admin user and return response DTO', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      repository.createAdminUser.mockResolvedValue(mockAdminUser);
      const params = {
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: AdminRole.VIEWER,
      };

      const result = await service.createAdminUser(params);

      expect(repository.createAdminUser).toHaveBeenCalledWith(params);
      expect(result).toStrictEqual(toAdminUserResponseDto(mockAdminUser));
    });
  });

  describe('createManyAndReturnAdminUsers', () => {
    it('should create multiple admin users and return response DTO', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      repository.createManyAndReturnAdminUsers.mockResolvedValue(mockAdminUsers);
      const params = {
        adminUsers: mockAdminUsers.map((user) => ({
          email: user.email,
          name: user.name,
          role: user.role,
        })),
      };

      const result = await service.createManyAndReturnAdminUsers(params);

      expect(repository.createManyAndReturnAdminUsers).toHaveBeenCalledWith(params.adminUsers);
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
      queryService.findAdminUserByIdOrFail.mockResolvedValue(mockResponseDto);
      repository.updateAdminUser.mockResolvedValue(updatedAdminUser);

      const params = {
        publicId: mockAdminUser.publicId,
        data: {
          name: 'Updated Admin Name',
          role: AdminRole.ADMIN,
        },
      };

      const result = await service.updateAdminUserById(params);

      expect(queryService.findAdminUserByIdOrFail).toHaveBeenCalledWith({ publicId: params.publicId });
      expect(repository.updateAdminUser).toHaveBeenCalledWith({
        where: { publicId: params.publicId },
        data: params.data,
      });
      expect(result).toStrictEqual(toAdminUserResponseDto(updatedAdminUser));
    });

    it('should throw error if admin user does not exist', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      const error = new Error('AdminUser not found');
      queryService.findAdminUserByIdOrFail.mockRejectedValue(error);

      const params = {
        publicId,
        data: { name: 'Updated Name' },
      };

      await expect(service.updateAdminUserById(params)).rejects.toThrow(error);
      expect(repository.updateAdminUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteAdminUserById', () => {
    it('should verify admin user exists and delete it', async () => {
      expect.assertions(3);

      const mockAdminUser = adminUserFactory.build();
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      queryService.findAdminUserByIdOrFail.mockResolvedValue(mockResponseDto);
      repository.deleteAdminUser.mockResolvedValue(undefined);

      const params = { publicId: mockAdminUser.publicId };

      await service.deleteAdminUserById(params);

      expect(queryService.findAdminUserByIdOrFail).toHaveBeenCalledWith(params);
      expect(repository.deleteAdminUser).toHaveBeenCalledWith(params);
      expect(repository.deleteAdminUser).toHaveBeenCalledTimes(1);
    });

    it('should throw error if admin user does not exist', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      const error = new Error('AdminUser not found');
      queryService.findAdminUserByIdOrFail.mockRejectedValue(error);

      await expect(service.deleteAdminUserById({ publicId })).rejects.toThrow(error);
      expect(repository.deleteAdminUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyAdminUsersById', () => {
    it('should delete multiple admin users without verification', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2', 'id3'];
      repository.deleteManyAdminUsers.mockResolvedValue(undefined);
      const params = { publicIds };

      await service.deleteManyAdminUsersById(params);

      expect(repository.deleteManyAdminUsers).toHaveBeenCalledWith({
        publicId: { in: publicIds },
      });
      expect(queryService.findAdminUserByIdOrFail).not.toHaveBeenCalled();
    });

    it('should handle empty array of IDs', async () => {
      expect.assertions(1);

      const publicIds: string[] = [];
      repository.deleteManyAdminUsers.mockResolvedValue(undefined);

      await service.deleteManyAdminUsersById({ publicIds });

      expect(repository.deleteManyAdminUsers).toHaveBeenCalledWith({
        publicId: { in: [] },
      });
    });
  });
});
