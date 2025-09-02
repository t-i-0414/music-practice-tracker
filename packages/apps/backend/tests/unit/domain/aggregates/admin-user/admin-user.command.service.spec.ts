import { TestingModule } from '@nestjs/testing';

import { AdminUserCommandService } from '@/domain/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/domain/aggregates/admin-user/utils/dto';
import { AdminRole } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
import { AdminUserFactory } from '@/tests/factory';
import {
  createMockAdminUserQueryService,
  createMockAdminUserRepository,
} from '@/tests/unit/domain/helpers/domain-service-mocks';

describe('unit AdminUserCommandService', () => {
  let service: AdminUserCommandService;
  let repository: ReturnType<typeof createMockAdminUserRepository>;
  let _queryService: jest.Mocked<AdminUserQueryService>;
  let adminUserFactory: AdminUserFactory;
  let module: TestingModule;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    repository = createMockAdminUserRepository();
    const mockQueryService = createMockAdminUserQueryService();

    const { Test } = await import('@nestjs/testing');
    module = await Test.createTestingModule({
      providers: [
        AdminUserCommandService,
        {
          provide: RepositoryService,
          useValue: repository,
        },
        {
          provide: AdminUserQueryService,
          useValue: mockQueryService,
        },
      ],
    }).compile();

    service = module.get<AdminUserCommandService>(AdminUserCommandService);
    _queryService = module.get(AdminUserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdminUser', () => {
    it('should successfully create an admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const createDto = {
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: mockAdminUser.role,
      };

      repository.adminUser.create.mockResolvedValue(mockAdminUser);

      const result = await service.createAdminUser(createDto);

      expect(repository.adminUser.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toStrictEqual(toAdminUserResponseDto(mockAdminUser));
    });

    it('should throw error on database failure', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
        role: AdminRole.ADMIN,
      };

      const prismaError = new Error('Database error');
      repository.adminUser.create.mockRejectedValue(prismaError);

      await expect(service.createAdminUser(createDto)).rejects.toThrow(prismaError);
      expect(repository.adminUser.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('createManyAndReturnAdminUsers', () => {
    it('should successfully create multiple admin users', async () => {
      expect.assertions(2);

      const mockAdminUsers = adminUserFactory.buildMany(3);
      const createDto = {
        adminUsers: mockAdminUsers.map((user) => ({
          email: user.email,
          name: user.name,
          role: user.role,
        })),
      };

      repository.adminUser.createManyAndReturn.mockResolvedValue(mockAdminUsers);

      const result = await service.createManyAndReturnAdminUsers(createDto);

      expect(repository.adminUser.createManyAndReturn).toHaveBeenCalledWith({ data: createDto.adminUsers });
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });
  });

  describe('updateAdminUserById', () => {
    it('should successfully update an admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const { publicId } = mockAdminUser;
      const updateData = { name: 'Updated Name' };

      const updatedAdminUser = { ...mockAdminUser, ...updateData };
      repository.adminUser.update.mockResolvedValue(updatedAdminUser);

      const result = await service.updateAdminUserById({ publicId, data: updateData });

      expect(repository.adminUser.update).toHaveBeenCalledWith({
        where: { publicId },
        data: updateData,
      });
      expect(result).toStrictEqual(toAdminUserResponseDto(updatedAdminUser));
    });

    it('should throw error on database failure', async () => {
      expect.assertions(2);

      const publicId = 'test-id';
      const updateData = { name: 'Updated Name' };

      const prismaError = new Error('Database error');
      repository.adminUser.update.mockRejectedValue(prismaError);

      await expect(service.updateAdminUserById({ publicId, data: updateData })).rejects.toThrow(prismaError);
      expect(repository.adminUser.update).toHaveBeenCalledWith({
        where: { publicId },
        data: updateData,
      });
    });
  });

  describe('deleteAdminUserById', () => {
    it('should successfully delete an admin user', async () => {
      expect.assertions(1);

      const mockAdminUser = adminUserFactory.build();
      const { publicId } = mockAdminUser;

      repository.adminUser.delete.mockResolvedValue(mockAdminUser);

      await service.deleteAdminUserById({ publicId });

      expect(repository.adminUser.delete).toHaveBeenCalledWith({ where: { publicId } });
    });

    it('should throw error on database failure', async () => {
      expect.assertions(2);

      const publicId = 'test-id';

      const prismaError = new Error('Database error');
      repository.adminUser.delete.mockRejectedValue(prismaError);

      await expect(service.deleteAdminUserById({ publicId })).rejects.toThrow(prismaError);
      expect(repository.adminUser.delete).toHaveBeenCalledWith({ where: { publicId } });
    });
  });

  describe('deleteManyAdminUsersByIds', () => {
    it('should successfully delete multiple admin users', async () => {
      expect.assertions(1);

      const publicIds = ['id1', 'id2', 'id3'];
      repository.adminUser.deleteMany.mockResolvedValue({ count: publicIds.length });

      await service.deleteManyAdminUsersByIds({ publicIds });

      expect(repository.adminUser.deleteMany).toHaveBeenCalledWith({
        where: { publicId: { in: publicIds } },
      });
    });
  });
});
