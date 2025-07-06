import { Test, type TestingModule } from '@nestjs/testing';

import { createUserEntity } from '../../../helpers';

import { UserRepositoryService, type User } from '@/modules/aggregate/user/user.repository.service';
import { RepositoryService } from '@/modules/repository/repository.service';

describe('UserRepositoryService', () => {
  let service: UserRepositoryService;

  const mockUser: User = createUserEntity({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  });

  const deletedUserFixture: User = createUserEntity({
    ...mockUser,
    id: '123e4567-e89b-12d3-a456-426614174001',
    deletedAt: new Date('2024-01-02T00:00:00.000Z'),
  });

  const mockRepositoryService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createManyAndReturn: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      updateManyAndReturn: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryService,
        {
          provide: RepositoryService,
          useValue: mockRepositoryService,
        },
      ],
    }).compile();

    service = module.get<UserRepositoryService>(UserRepositoryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUniqueActiveUser', () => {
    it('should find an active user by id', async () => {
      const params = { id: mockUser.id };
      mockRepositoryService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUniqueActiveUser(params);

      expect(mockRepositoryService.user.findUnique).toHaveBeenCalledWith({
        where: {
          ...params,
          deletedAt: null,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const params = { id: 'non-existent-id' };
      mockRepositoryService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUniqueActiveUser(params);

      expect(result).toBeNull();
    });
  });

  describe('findUniqueDeletedUser', () => {
    it('should find a deleted user by id', async () => {
      const params = { id: deletedUserFixture.id };
      mockRepositoryService.user.findUnique.mockResolvedValue(deletedUserFixture);

      const result = await service.findUniqueDeletedUser(params);

      expect(mockRepositoryService.user.findUnique).toHaveBeenCalledWith({
        where: {
          ...params,
          deletedAt: { not: null },
        },
      });
      expect(result).toEqual(deletedUserFixture);
    });

    it('should return null when deleted user is not found', async () => {
      const params = { id: 'non-existent-id' };
      mockRepositoryService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUniqueDeletedUser(params);

      expect(result).toBeNull();
    });
  });

  describe('findUniqueAnyUser', () => {
    it('should find any user (active or deleted) by id', async () => {
      const params = { id: mockUser.id };
      mockRepositoryService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUniqueAnyUser(params);

      expect(mockRepositoryService.user.findUnique).toHaveBeenCalledWith({
        where: {
          ...params,
          OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const params = { id: 'non-existent-id' };
      mockRepositoryService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUniqueAnyUser(params);

      expect(result).toBeNull();
    });
  });

  describe('findManyActiveUsers', () => {
    it('should find many active users with all parameters', async () => {
      const params = {
        skip: 0,
        take: 10,
        cursor: { id: mockUser.id },
        where: { name: { contains: 'Test' } },
        orderBy: { createdAt: 'desc' as const },
      };
      const mockUsers = [mockUser];
      mockRepositoryService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findManyActiveUsers(params);

      expect(mockRepositoryService.user.findMany).toHaveBeenCalledWith({
        ...params,
        where: {
          ...params.where,
          deletedAt: null,
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should find many active users without optional parameters', async () => {
      const params = {};
      const mockUsers = [mockUser];
      mockRepositoryService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findManyActiveUsers(params);

      expect(mockRepositoryService.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users found', async () => {
      const params = {};
      mockRepositoryService.user.findMany.mockResolvedValue([]);

      const result = await service.findManyActiveUsers(params);

      expect(result).toEqual([]);
    });
  });

  describe('findManyDeletedUsers', () => {
    it('should find many deleted users with all parameters', async () => {
      const params = {
        skip: 0,
        take: 10,
        cursor: { id: deletedUserFixture.id },
        where: { name: { contains: 'Test' } },
        orderBy: { createdAt: 'desc' as const },
      };
      const mockUsers = [deletedUserFixture];
      mockRepositoryService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findManyDeletedUsers(params);

      expect(mockRepositoryService.user.findMany).toHaveBeenCalledWith({
        ...params,
        where: {
          ...params.where,
          deletedAt: { not: null },
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should find many deleted users without optional parameters', async () => {
      const params = {};
      const mockUsers = [deletedUserFixture];
      mockRepositoryService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findManyDeletedUsers(params);

      expect(mockRepositoryService.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: { not: null },
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findManyAnyUsers', () => {
    it('should find many users (active and deleted) with all parameters', async () => {
      const params = {
        skip: 0,
        take: 10,
        cursor: { id: mockUser.id },
        where: { name: { contains: 'Test' } },
        orderBy: { createdAt: 'desc' as const },
      };
      const mockUsers = [mockUser, deletedUserFixture];
      mockRepositoryService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findManyAnyUsers(params);

      expect(mockRepositoryService.user.findMany).toHaveBeenCalledWith({
        ...params,
        where: {
          ...params.where,
          OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should find many users without optional parameters', async () => {
      const params = {};
      const mockUsers = [mockUser, deletedUserFixture];
      mockRepositoryService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findManyAnyUsers(params);

      expect(mockRepositoryService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createInput = {
        name: 'New User',
        email: 'new@example.com',
      };
      mockRepositoryService.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createInput);

      expect(mockRepositoryService.user.create).toHaveBeenCalledWith({
        data: createInput,
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle database error during creation', async () => {
      const createInput = {
        name: 'New User',
        email: 'new@example.com',
      };
      const error = new Error('Database error');
      mockRepositoryService.user.create.mockRejectedValue(error);

      await expect(service.createUser(createInput)).rejects.toThrow(error);
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should create multiple users and return them', async () => {
      const createInputs = [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
      ];
      const mockUsers = [mockUser, { ...mockUser, id: 'another-id' }];
      mockRepositoryService.user.createManyAndReturn.mockResolvedValue(mockUsers);

      const result = await service.createManyAndReturnUsers(createInputs);

      expect(mockRepositoryService.user.createManyAndReturn).toHaveBeenCalledWith({
        data: createInputs,
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when creating empty array', async () => {
      const createInputs: { name: string; email: string }[] = [];
      mockRepositoryService.user.createManyAndReturn.mockResolvedValue([]);

      const result = await service.createManyAndReturnUsers(createInputs);

      expect(mockRepositoryService.user.createManyAndReturn).toHaveBeenCalledWith({
        data: createInputs,
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const params = {
        where: { id: mockUser.id },
        data: { name: 'Updated Name' },
      };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockRepositoryService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser(params);

      expect(mockRepositoryService.user.update).toHaveBeenCalledWith({
        data: {
          ...params.data,
        },
        where: params.where,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle complex update data', async () => {
      const params = {
        where: { id: mockUser.id },
        data: {
          name: 'Updated Name',
          email: 'updated@example.com',
        },
      };
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      mockRepositoryService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser(params);

      expect(mockRepositoryService.user.update).toHaveBeenCalledWith({
        data: {
          ...params.data,
        },
        where: params.where,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle database error during update', async () => {
      const params = {
        where: { id: mockUser.id },
        data: { name: 'Updated Name' },
      };
      const error = new Error('Database error');
      mockRepositoryService.user.update.mockRejectedValue(error);

      await expect(service.updateUser(params)).rejects.toThrow(error);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      const params = { id: mockUser.id };
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      mockRepositoryService.user.update.mockResolvedValue(deletedUser);

      await service.deleteUser(params);

      expect(mockRepositoryService.user.update).toHaveBeenCalledWith({
        where: params,
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should handle database error during soft delete', async () => {
      const params = { id: mockUser.id };
      const error = new Error('Database error');
      mockRepositoryService.user.update.mockRejectedValue(error);

      await expect(service.deleteUser(params)).rejects.toThrow(error);
    });
  });

  describe('deleteManyUsers', () => {
    it('should soft delete many users', async () => {
      const params = { name: { contains: 'Test' } };
      mockRepositoryService.user.updateMany.mockResolvedValue({ count: 2 });

      await service.deleteManyUsers(params);

      expect(mockRepositoryService.user.updateMany).toHaveBeenCalledWith({
        where: params,
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should handle empty where clause', async () => {
      const params = {};
      mockRepositoryService.user.updateMany.mockResolvedValue({ count: 0 });

      await service.deleteManyUsers(params);

      expect(mockRepositoryService.user.updateMany).toHaveBeenCalledWith({
        where: params,
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });
  });

  describe('hardDeleteUser', () => {
    it('should permanently delete a user', async () => {
      const params = { id: mockUser.id };
      mockRepositoryService.user.delete.mockResolvedValue(mockUser);

      await service.hardDeleteUser(params);

      expect(mockRepositoryService.user.delete).toHaveBeenCalledWith({
        where: params,
      });
    });

    it('should handle database error during hard delete', async () => {
      const params = { id: mockUser.id };
      const error = new Error('Database error');
      mockRepositoryService.user.delete.mockRejectedValue(error);

      await expect(service.hardDeleteUser(params)).rejects.toThrow(error);
    });
  });

  describe('hardDeleteManyUsers', () => {
    it('should permanently delete many users', async () => {
      const params = { name: { contains: 'Test' } };
      mockRepositoryService.user.deleteMany.mockResolvedValue({ count: 2 });

      await service.hardDeleteManyUsers(params);

      expect(mockRepositoryService.user.deleteMany).toHaveBeenCalledWith({
        where: params,
      });
    });

    it('should handle complex where conditions', async () => {
      const params = {
        OR: [{ email: { contains: '@test.com' } }, { name: { startsWith: 'Test' } }],
      };
      mockRepositoryService.user.deleteMany.mockResolvedValue({ count: 5 });

      await service.hardDeleteManyUsers(params);

      expect(mockRepositoryService.user.deleteMany).toHaveBeenCalledWith({
        where: params,
      });
    });
  });

  describe('restoreUser', () => {
    it('should restore a soft deleted user', async () => {
      const params = { id: deletedUserFixture.id };
      const restoredUser = { ...deletedUserFixture, deletedAt: null };
      mockRepositoryService.user.update.mockResolvedValue(restoredUser);

      const result = await service.restoreUser(params);

      expect(mockRepositoryService.user.update).toHaveBeenCalledWith({
        where: params,
        data: {
          deletedAt: null,
        },
      });
      expect(result).toEqual(restoredUser);
    });

    it('should handle database error during restore', async () => {
      const params = { id: deletedUserFixture.id };
      const error = new Error('Database error');
      mockRepositoryService.user.update.mockRejectedValue(error);

      await expect(service.restoreUser(params)).rejects.toThrow(error);
    });
  });

  describe('restoreManyAndReturnUsers', () => {
    it('should restore many users and return them', async () => {
      const params = { deletedAt: { not: null } };
      const restoredUsers = [
        { ...deletedUserFixture, deletedAt: null },
        { ...deletedUserFixture, id: 'another-id', deletedAt: null },
      ];
      mockRepositoryService.user.updateManyAndReturn.mockResolvedValue(restoredUsers);

      const result = await service.restoreManyAndReturnUsers(params);

      expect(mockRepositoryService.user.updateManyAndReturn).toHaveBeenCalledWith({
        where: params,
        data: {
          deletedAt: null,
        },
      });
      expect(result).toEqual(restoredUsers);
    });

    it('should handle complex where conditions', async () => {
      const params = {
        AND: [{ deletedAt: { not: null } }, { email: { contains: '@example.com' } }],
      };
      const restoredUsers = [{ ...deletedUserFixture, deletedAt: null }];
      mockRepositoryService.user.updateManyAndReturn.mockResolvedValue(restoredUsers);

      const result = await service.restoreManyAndReturnUsers(params);

      expect(mockRepositoryService.user.updateManyAndReturn).toHaveBeenCalledWith({
        where: params,
        data: {
          deletedAt: null,
        },
      });
      expect(result).toEqual(restoredUsers);
    });

    it('should return empty array when no users to restore', async () => {
      const params = { id: 'non-existent' };
      mockRepositoryService.user.updateManyAndReturn.mockResolvedValue([]);

      const result = await service.restoreManyAndReturnUsers(params);

      expect(result).toEqual([]);
    });
  });
});
