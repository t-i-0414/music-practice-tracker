import { Test, TestingModule } from '@nestjs/testing';

import { AdminUserCommandService } from '@/aggregates/admin-user/command.service';
import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/aggregates/admin-user/dto';
import { AdminUserErrorCode, AdminUserError } from '@/aggregates/admin-user/error';
import { AdminUserQueryService } from '@/aggregates/admin-user/query.service';
import { AdminRole } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
import { AdminUserFactory } from '@/tests/factory';
import { Ok, Err } from '@/utils/result';

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
      findManyAdminUsers: jest.fn(),
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
    it('should successfully create an admin user', async () => {
      expect.assertions(3);

      const mockAdminUser = adminUserFactory.build();
      const createDto = {
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: mockAdminUser.role,
      };

      repository.adminUser.create.mockResolvedValue(mockAdminUser);

      const result = await service.createAdminUser(createDto);

      expect(repository.adminUser.create).toHaveBeenCalledWith({ data: createDto });
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toStrictEqual(toAdminUserResponseDto(mockAdminUser));
      }
    });

    it('should return error on database failure', async () => {
      expect.assertions(3);

      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
        role: AdminRole.ADMIN,
      };

      const prismaError = new Error('Database error');
      repository.adminUser.create.mockRejectedValue(prismaError);

      const result = await service.createAdminUser(createDto);

      expect(repository.adminUser.create).toHaveBeenCalledWith({ data: createDto });
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(AdminUserErrorCode.DATABASE_ERROR);
      }
    });
  });

  describe('createManyAndReturnAdminUsers', () => {
    it('should successfully create multiple admin users', async () => {
      expect.assertions(3);

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
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
      }
    });
  });

  describe('updateAdminUserById', () => {
    it('should successfully update an admin user', async () => {
      expect.assertions(4);

      const mockAdminUser = adminUserFactory.build();
      const {publicId} = mockAdminUser;
      const updateData = { name: 'Updated Name' };

      const updatedAdminUser = { ...mockAdminUser, ...updateData };
      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(Ok(toAdminUserResponseDto(mockAdminUser)));
      repository.adminUser.update.mockResolvedValue(updatedAdminUser);

      const result = await service.updateAdminUserById({ publicId, data: updateData });

      expect(queryService.findUniqueOrThrowAdminUser).toHaveBeenCalledWith({ publicId });
      expect(repository.adminUser.update).toHaveBeenCalledWith({
        where: { publicId },
        data: updateData,
      });
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toStrictEqual(toAdminUserResponseDto(updatedAdminUser));
      }
    });

    it('should return error when admin user not found', async () => {
      expect.assertions(3);

      const publicId = 'non-existent-id';
      const updateData = { name: 'Updated Name' };

      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(Err(AdminUserError.notFound(publicId)));

      const result = await service.updateAdminUserById({ publicId, data: updateData });

      expect(repository.adminUser.update).not.toHaveBeenCalled();
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(AdminUserErrorCode.NOT_FOUND);
      }
    });
  });

  describe('deleteAdminUserById', () => {
    it('should successfully delete an admin user', async () => {
      expect.assertions(3);

      const mockAdminUser = adminUserFactory.build();
      const {publicId} = mockAdminUser;

      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(Ok(toAdminUserResponseDto(mockAdminUser)));
      repository.adminUser.delete.mockResolvedValue(mockAdminUser);

      const result = await service.deleteAdminUserById({ publicId });

      expect(queryService.findUniqueOrThrowAdminUser).toHaveBeenCalledWith({ publicId });
      expect(repository.adminUser.delete).toHaveBeenCalledWith({ where: { publicId } });
      expect(result.success).toBe(true);
    });

    it('should return error when admin user not found', async () => {
      expect.assertions(3);

      const publicId = 'non-existent-id';

      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(Err(AdminUserError.notFound(publicId)));

      const result = await service.deleteAdminUserById({ publicId });

      expect(repository.adminUser.delete).not.toHaveBeenCalled();
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(AdminUserErrorCode.NOT_FOUND);
      }
    });
  });

  describe('deleteManyAdminUsersByIds', () => {
    it('should successfully delete multiple admin users', async () => {
      expect.assertions(3);

      const mockAdminUsers = adminUserFactory.buildMany(3);
      const publicIds = mockAdminUsers.map((user) => user.publicId);

      queryService.findManyAdminUsers.mockResolvedValue(Ok(toAdminUsersResponseDto(mockAdminUsers)));
      repository.adminUser.deleteMany.mockResolvedValue({ count: publicIds.length });

      const result = await service.deleteManyAdminUsersByIds({ publicIds });

      expect(queryService.findManyAdminUsers).toHaveBeenCalledWith({ publicIds });
      expect(repository.adminUser.deleteMany).toHaveBeenCalledWith({
        where: { publicId: { in: publicIds } },
      });
      expect(result.success).toBe(true);
    });
  });
});
