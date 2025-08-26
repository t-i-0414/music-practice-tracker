import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/aggregates/admin-user/dto';
import { AdminUserQueryService } from '@/aggregates/admin-user/query.service';
import { RepositoryService } from '@/repository/service';
import { AdminUserFactory } from '@/tests/factory';

describe('adminUserQueryService', () => {
  let service: AdminUserQueryService;
  let repository: {
    adminUser: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockRepository = {
      adminUser: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserQueryService,
        {
          provide: RepositoryService,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AdminUserQueryService>(AdminUserQueryService);
    repository = module.get(RepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAdminUserByIdOrFail', () => {
    it('should return admin user response DTO when found', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      repository.adminUser.findUnique.mockResolvedValue(mockAdminUser);
      const params = { publicId: mockAdminUser.publicId };

      const result = await service.findAdminUserByIdOrFail(params);

      expect(repository.adminUser.findUnique).toHaveBeenCalledWith({ where: params });
      expect(result).toStrictEqual(toAdminUserResponseDto(mockAdminUser));
    });

    it('should throw NotFoundException when admin user not found', async () => {
      expect.assertions(2);

      repository.adminUser.findUnique.mockResolvedValue(null);
      const params = { publicId: 'non-existent-id' };

      await expect(service.findAdminUserByIdOrFail(params)).rejects.toThrow(NotFoundException);
      expect(repository.adminUser.findUnique).toHaveBeenCalledWith({ where: params });
    });

    it('should throw NotFoundException with proper message', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      repository.adminUser.findUnique.mockResolvedValue(null);
      const params = { publicId };

      await expect(service.findAdminUserByIdOrFail(params)).rejects.toThrow(`AdminUser ${publicId} not found`);
      expect(repository.adminUser.findUnique).toHaveBeenCalledWith({ where: params });
    });
  });

  describe('findManyAdminUsers', () => {
    it('should return admin users response DTO', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      const publicIds = mockAdminUsers.map((user) => user.publicId);
      repository.adminUser.findMany.mockResolvedValue(mockAdminUsers);

      const result = await service.findManyAdminUsers({ publicIds });

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        where: {
          publicId: { in: publicIds },
        },
      });
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });

    it('should return empty response when no admin users found', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2'];
      repository.adminUser.findMany.mockResolvedValue([]);

      const result = await service.findManyAdminUsers({ publicIds });

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        where: {
          publicId: { in: publicIds },
        },
      });
      expect(result).toStrictEqual(toAdminUsersResponseDto([]));
    });
  });

  describe('findAllAdminUsers', () => {
    it('should return all admin users', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build(), adminUserFactory.build()];
      repository.adminUser.findMany.mockResolvedValue(mockAdminUsers);

      const result = await service.findAllAdminUsers();

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({ where: {} });
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });

    it('should return empty response when no admin users exist', async () => {
      expect.assertions(2);

      repository.adminUser.findMany.mockResolvedValue([]);

      const result = await service.findAllAdminUsers();

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({ where: {} });
      expect(result).toStrictEqual(toAdminUsersResponseDto([]));
    });
  });
});
