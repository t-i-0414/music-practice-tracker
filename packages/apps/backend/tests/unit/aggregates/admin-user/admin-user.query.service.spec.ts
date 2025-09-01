import { Test, TestingModule } from '@nestjs/testing';

import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/aggregates/admin-user/dto';
import { AdminUserErrorCode } from '@/aggregates/admin-user/error';
import { AdminUserQueryService } from '@/aggregates/admin-user/query.service';
import { RepositoryService } from '@/repository/repository.service';
import { AdminUserFactory } from '@/tests/factory';

describe('adminUserQueryService', () => {
  let service: AdminUserQueryService;
  let repository: {
    adminUser: {
      findUniqueOrThrow: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockRepository = {
      adminUser: {
        findUniqueOrThrow: jest.fn(),
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

  describe('findUniqueAdminUserByIdOrFail', () => {
    it('should return admin user response DTO when found', async () => {
      expect.assertions(3);

      const mockAdminUser = adminUserFactory.build();
      repository.adminUser.findUniqueOrThrow.mockResolvedValue(mockAdminUser);
      const params = { publicId: mockAdminUser.publicId };

      const result = await service.findUniqueOrThrowAdminUser(params);

      expect(repository.adminUser.findUniqueOrThrow).toHaveBeenCalledWith({ where: params });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toStrictEqual(toAdminUserResponseDto(mockAdminUser));
      }
    });

    it('should return error when admin user not found', async () => {
      expect.assertions(3);

      const params = { publicId: 'non-existent-id' };
      repository.adminUser.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      const result = await service.findUniqueOrThrowAdminUser(params);

      expect(repository.adminUser.findUniqueOrThrow).toHaveBeenCalledWith({ where: params });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(AdminUserErrorCode.NOT_FOUND);
      }
    });

    it('should return error when publicId is invalid', async () => {
      expect.assertions(3);

      const publicId = 'invalid-id';
      const params = { publicId };
      repository.adminUser.findUniqueOrThrow.mockRejectedValue(new Error('Invalid publicId'));

      const result = await service.findUniqueOrThrowAdminUser(params);

      expect(repository.adminUser.findUniqueOrThrow).toHaveBeenCalledWith({ where: params });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(AdminUserErrorCode.NOT_FOUND);
      }
    });
  });

  describe('findManyAdminUsers', () => {
    it('should return admin users response DTO when publicIds are provided', async () => {
      expect.assertions(3);

      const mockAdminUsers = adminUserFactory.buildMany(3);
      const publicIds = mockAdminUsers.map((user) => user.publicId);
      const params = { publicIds };

      repository.adminUser.findMany.mockResolvedValue(mockAdminUsers);

      const result = await service.findManyAdminUsers(params);

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        where: { publicId: { in: publicIds } },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
      }
    });

    it('should return empty array when no admin users found', async () => {
      expect.assertions(3);

      const publicIds = ['non-existent-1', 'non-existent-2'];
      const params = { publicIds };

      repository.adminUser.findMany.mockResolvedValue([]);

      const result = await service.findManyAdminUsers(params);

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        where: { publicId: { in: publicIds } },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toStrictEqual(toAdminUsersResponseDto([]));
      }
    });
  });

  describe('findAllAdminUsers', () => {
    it('should return all admin users with default ordering', async () => {
      expect.assertions(3);

      const mockAdminUsers = adminUserFactory.buildMany(5);
      repository.adminUser.findMany.mockResolvedValue(mockAdminUsers);

      const result = await service.findAllAdminUsers();

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
      }
    });

    it('should return empty array when no admin users exist', async () => {
      expect.assertions(3);

      repository.adminUser.findMany.mockResolvedValue([]);

      const result = await service.findAllAdminUsers();

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toStrictEqual(toAdminUsersResponseDto([]));
      }
    });
  });

  describe('findManyAdminUsersByFilter', () => {
    it('should apply filter parameters correctly', async () => {
      expect.assertions(2);

      const mockAdminUsers = adminUserFactory.buildMany(3);
      const filterParams = {
        skip: 10,
        take: 5,
        where: { email: { contains: 'test' } },
        orderBy: { email: 'asc' as const },
      };

      repository.adminUser.findMany.mockResolvedValue(mockAdminUsers);

      const result = await service.findManyAdminUsersByFilter(filterParams);

      expect(repository.adminUser.findMany).toHaveBeenCalledWith(filterParams);
      expect(result).toStrictEqual(mockAdminUsers);
    });
  });
});
