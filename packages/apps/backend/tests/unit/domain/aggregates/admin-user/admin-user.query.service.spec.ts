import { Test, TestingModule } from '@nestjs/testing';

import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/domain/aggregates/admin-user/utils/dto';
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

  describe('findUniqueOrThrowAdminUser', () => {
    it('should return admin user when found', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      repository.adminUser.findUniqueOrThrow.mockResolvedValue(mockAdminUser);
      const dto = { publicId: mockAdminUser.publicId };

      const result = await service.findUniqueOrThrowAdminUser(dto);

      expect(repository.adminUser.findUniqueOrThrow).toHaveBeenCalledWith({ where: { publicId: dto.publicId } });
      expect(result).toStrictEqual(toAdminUserResponseDto(mockAdminUser));
    });

    it('should throw error when admin user not found', async () => {
      expect.assertions(2);

      const dto = { publicId: 'non-existent-id' };
      const error = new Error('No AdminUser found');
      repository.adminUser.findUniqueOrThrow.mockRejectedValue(error);

      await expect(service.findUniqueOrThrowAdminUser(dto)).rejects.toThrow(error);
      expect(repository.adminUser.findUniqueOrThrow).toHaveBeenCalledWith({ where: { publicId: dto.publicId } });
    });
  });

  describe('findManyAdminUsersById', () => {
    it('should return admin users when found', async () => {
      expect.assertions(2);

      const mockAdminUsers = adminUserFactory.buildMany(3);
      repository.adminUser.findMany.mockResolvedValue(mockAdminUsers);
      const dto = { publicIds: mockAdminUsers.map((u) => u.publicId) };

      const result = await service.findManyAdminUsersById(dto);

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });

    it('should return empty array when no admin users found', async () => {
      expect.assertions(2);

      repository.adminUser.findMany.mockResolvedValue([]);
      const dto = { publicIds: ['non-existent-id'] };

      const result = await service.findManyAdminUsersById(dto);

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toAdminUsersResponseDto([]));
    });
  });

  describe('findAllAdminUsers', () => {
    it('should return all admin users', async () => {
      expect.assertions(2);

      const mockAdminUsers = adminUserFactory.buildMany(5);
      repository.adminUser.findMany.mockResolvedValue(mockAdminUsers);

      const result = await service.findAllAdminUsers();

      expect(repository.adminUser.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });
  });
});
