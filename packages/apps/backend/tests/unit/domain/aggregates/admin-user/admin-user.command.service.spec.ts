import { Test } from '@nestjs/testing';

import { AdminUserCommandService } from '@/domain/aggregates/admin-user/admin-user.command.service';
import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/domain/aggregates/admin-user/utils/dto';
import { AdminRole } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
import { AdminUserFactory } from '@/tests/factory';

describe('unit AdminUserCommandService', () => {
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

    const module = await Test.createTestingModule({
      providers: [
        AdminUserCommandService,
        {
          provide: RepositoryService,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AdminUserCommandService>(AdminUserCommandService);
    repository = module.get(RepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdminUser', () => {
    it('should successfully create an admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const createDto = {
        cognitoSub: mockAdminUser.cognitoSub,
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
        cognitoSub: 'sub-test',
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
          cognitoSub: user.cognitoSub,
          name: user.name,
          role: user.role,
        })),
      };

      repository.adminUser.createManyAndReturn.mockResolvedValue(mockAdminUsers);

      const result = await service.createManyAndReturnAdminUsers(createDto);

      expect(repository.adminUser.createManyAndReturn).toHaveBeenCalledWith({ data: createDto.adminUsers });
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });

    it('should throw error on database failure', async () => {
      expect.assertions(2);

      const createDto = {
        adminUsers: [
          { cognitoSub: 'sub-1', name: 'Admin 1', role: AdminRole.ADMIN },
          { cognitoSub: 'sub-2', name: 'Admin 2', role: AdminRole.SUPER_ADMIN },
        ],
      };

      const prismaError = new Error('Database error');
      repository.adminUser.createManyAndReturn.mockRejectedValue(prismaError);

      await expect(service.createManyAndReturnAdminUsers(createDto)).rejects.toThrow(prismaError);
      expect(repository.adminUser.createManyAndReturn).toHaveBeenCalledWith({ data: createDto.adminUsers });
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

    it('should throw error on database failure', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2', 'id3'];

      const prismaError = new Error('Database error');
      repository.adminUser.deleteMany.mockRejectedValue(prismaError);

      await expect(service.deleteManyAdminUsersByIds({ publicIds })).rejects.toThrow(prismaError);
      expect(repository.adminUser.deleteMany).toHaveBeenCalledWith({
        where: { publicId: { in: publicIds } },
      });
    });
  });
});
