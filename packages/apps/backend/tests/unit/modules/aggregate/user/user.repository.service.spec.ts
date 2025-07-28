import { Test, TestingModule } from '@nestjs/testing';

import { Prisma } from '@/generated/prisma';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import { RepositoryService } from '@/modules/repository/repository.service';

describe('userRepositoryService', () => {
  let service: UserRepositoryService;
  let userModel: any;

  const mockUser = {
    publicId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockDeletedUser = {
    ...mockUser,
    publicId: '223e4567-e89b-12d3-a456-426614174001',
    deletedAt: new Date('2024-01-02'),
  };

  beforeEach(async () => {
    userModel = {
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
      user: userModel,
    } as unknown as jest.Mocked<RepositoryService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryService,
        {
          provide: RepositoryService,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserRepositoryService>(UserRepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUniqueActiveUser', () => {
    it('should find active user with deletedAt null', async () => {
      expect.assertions(2);

      userModel.findUnique.mockResolvedValue(mockUser);
      const params = { publicId: mockUser.publicId };

      const result = await service.findUniqueActiveUser(params);

      expect(userModel.findUnique).toHaveBeenCalledWith({
        where: {
          ...params,
          deletedAt: null,
        },
      });
      expect(result).toStrictEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      expect.assertions(2);

      userModel.findUnique.mockResolvedValue(null);
      const params = { publicId: 'non-existent-publicId' };

      const result = await service.findUniqueActiveUser(params);

      expect(userModel.findUnique).toHaveBeenCalledWith({
        where: {
          ...params,
          deletedAt: null,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('findUniqueDeletedUser', () => {
    it('should find deleted user', async () => {
      expect.assertions(2);

      userModel.findUnique.mockResolvedValue(mockDeletedUser);
      const params = { publicId: mockDeletedUser.publicId };

      const result = await service.findUniqueDeletedUser(params);

      expect(userModel.findUnique).toHaveBeenCalledWith({
        where: {
          ...params,
          deletedAt: { not: null },
        },
      });
      expect(result).toStrictEqual(mockDeletedUser);
    });
  });

  describe('findUniqueAnyUser', () => {
    it('should find any user regardless of deletion status', async () => {
      expect.assertions(2);

      userModel.findUnique.mockResolvedValue(mockUser);
      const params = { publicId: mockUser.publicId };

      const result = await service.findUniqueAnyUser(params);

      expect(userModel.findUnique).toHaveBeenCalledWith({
        where: {
          ...params,
          OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
        },
      });
      expect(result).toStrictEqual(mockUser);
    });
  });

  describe('findManyActiveUsers', () => {
    it('should find many active users with pagination', async () => {
      expect.assertions(2);

      const mockUsers = [mockUser];
      userModel.findMany.mockResolvedValue(mockUsers);
      const params = {
        skip: 10,
        take: 20,
        where: { email: { contains: 'test' } },
        orderBy: { createdAt: Prisma.SortOrder.desc },
      };

      const result = await service.findManyActiveUsers(params);

      expect(userModel.findMany).toHaveBeenCalledWith({
        ...params,
        where: {
          ...params.where,
          deletedAt: null,
        },
      });
      expect(result).toStrictEqual(mockUsers);
    });
  });

  describe('findManyDeletedUsers', () => {
    it('should find many deleted users', async () => {
      expect.assertions(2);

      const mockUsers = [mockDeletedUser];
      userModel.findMany.mockResolvedValue(mockUsers);
      const params = {
        where: { email: { contains: 'test' } },
      };

      const result = await service.findManyDeletedUsers(params);

      expect(userModel.findMany).toHaveBeenCalledWith({
        ...params,
        where: {
          ...params.where,
          deletedAt: { not: null },
        },
      });
      expect(result).toStrictEqual(mockUsers);
    });
  });

  describe('findManyAnyUsers', () => {
    it('should find many users regardless of deletion status', async () => {
      expect.assertions(2);

      const mockUsers = [mockUser, mockDeletedUser];
      userModel.findMany.mockResolvedValue(mockUsers);
      const params = {
        where: { email: { contains: 'test' } },
      };

      const result = await service.findManyAnyUsers(params);

      expect(userModel.findMany).toHaveBeenCalledWith({
        ...params,
        where: {
          ...params.where,
          OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
        },
      });
      expect(result).toStrictEqual(mockUsers);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      expect.assertions(2);

      userModel.create.mockResolvedValue(mockUser);
      const params = { email: mockUser.email, name: mockUser.name };

      const result = await service.createUser(params);

      expect(userModel.create).toHaveBeenCalledWith({
        data: params,
      });
      expect(result).toStrictEqual(mockUser);
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should create many users and return them', async () => {
      expect.assertions(2);

      const params = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
      ];
      const mockUsers = [mockUser, { ...mockUser, publicId: '223e4567-e89b-12d3-a456-426614174002' }];
      userModel.createManyAndReturn.mockResolvedValue(mockUsers);

      const result = await service.createManyAndReturnUsers(params);

      expect(userModel.createManyAndReturn).toHaveBeenCalledWith({
        data: params,
      });
      expect(result).toStrictEqual(mockUsers);
    });
  });

  describe('updateUser', () => {
    it('should update an active user', async () => {
      expect.assertions(2);

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      userModel.update.mockResolvedValue(updatedUser);
      const params = {
        where: { publicId: mockUser.publicId },
        data: { name: 'Updated Name' },
      };

      const result = await service.updateUser(params);

      expect(userModel.update).toHaveBeenCalledWith({
        data: params.data,
        where: {
          ...params.where,
          deletedAt: null,
        },
      });
      expect(result).toStrictEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      expect.assertions(2);

      const mockDate = new Date('2024-01-03');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      userModel.update.mockResolvedValue({ ...mockUser, deletedAt: mockDate });
      const params = { publicId: mockUser.publicId };

      await service.deleteUser(params);

      expect(userModel.update).toHaveBeenCalledWith({
        where: {
          ...params,
          deletedAt: null,
        },
        data: {
          deletedAt: mockDate,
        },
      });
      expect(userModel.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteManyUsers', () => {
    it('should soft delete many users', async () => {
      expect.assertions(2);

      const mockDate = new Date('2024-01-03');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      userModel.updateMany.mockResolvedValue({ count: 2 });
      const params = { email: { contains: 'test' } };

      await service.deleteManyUsers(params);

      expect(userModel.updateMany).toHaveBeenCalledWith({
        where: params,
        data: {
          deletedAt: mockDate,
        },
      });
      expect(userModel.updateMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('hardDeleteUser', () => {
    it('should permanently delete a user', async () => {
      expect.assertions(2);

      userModel.delete.mockResolvedValue(mockUser);
      const params = { publicId: mockUser.publicId };

      await service.hardDeleteUser(params);

      expect(userModel.delete).toHaveBeenCalledWith({
        where: params,
      });
      expect(userModel.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('hardDeleteManyUsers', () => {
    it('should permanently delete many users', async () => {
      expect.assertions(2);

      userModel.deleteMany.mockResolvedValue({ count: 2 });
      const params = { email: { contains: 'test' } };

      await service.hardDeleteManyUsers(params);

      expect(userModel.deleteMany).toHaveBeenCalledWith({
        where: params,
      });
      expect(userModel.deleteMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('restoreUser', () => {
    it('should restore a deleted user', async () => {
      expect.assertions(2);

      const restoredUser = { ...mockDeletedUser, deletedAt: null };
      userModel.update.mockResolvedValue(restoredUser);
      const params = { publicId: mockDeletedUser.publicId };

      const result = await service.restoreUser(params);

      expect(userModel.update).toHaveBeenCalledWith({
        where: {
          ...params,
          deletedAt: { not: null },
        },
        data: {
          deletedAt: null,
        },
      });
      expect(result).toStrictEqual(restoredUser);
    });
  });

  describe('restoreManyAndReturnUsers', () => {
    it('should restore many deleted users and return them', async () => {
      expect.assertions(2);

      const restoredUsers = [
        { ...mockDeletedUser, deletedAt: null },
        { ...mockDeletedUser, publicId: '323e4567-e89b-12d3-a456-426614174003', deletedAt: null },
      ];
      userModel.updateManyAndReturn.mockResolvedValue(restoredUsers);
      const params = { email: { contains: 'test' } };

      const result = await service.restoreManyAndReturnUsers(params);

      expect(userModel.updateManyAndReturn).toHaveBeenCalledWith({
        where: {
          ...params,
          deletedAt: { not: null },
        },
        data: {
          deletedAt: null,
        },
      });
      expect(result).toStrictEqual(restoredUsers);
    });
  });
});
