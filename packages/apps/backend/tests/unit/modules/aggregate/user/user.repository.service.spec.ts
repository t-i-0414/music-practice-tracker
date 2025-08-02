import { Test, TestingModule } from '@nestjs/testing';

import { Prisma } from '@/generated/prisma';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import { RepositoryService } from '@/modules/repository/repository.service';
import { buildUserResponseDto } from '@/tests/factory/user.factory';

describe('userRepositoryService', () => {
  let service: UserRepositoryService;
  let userModel: any;

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

  describe('findUniqueUser', () => {
    it('should find user', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      userModel.findUnique.mockResolvedValue(mockUser);
      const params = { publicId: mockUser.publicId };

      const result = await service.findUniqueUser(params);

      expect(userModel.findUnique).toHaveBeenCalledWith({
        where: params,
      });
      expect(result).toStrictEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      expect.assertions(2);

      userModel.findUnique.mockResolvedValue(null);
      const params = { publicId: 'non-existent-publicId' };

      const result = await service.findUniqueUser(params);

      expect(userModel.findUnique).toHaveBeenCalledWith({
        where: params,
      });
      expect(result).toBeNull();
    });
  });

  describe('findManyUsers', () => {
    it('should find many users with pagination', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const mockUsers = [mockUser];
      userModel.findMany.mockResolvedValue(mockUsers);
      const params = {
        skip: 10,
        take: 20,
        where: { email: { contains: 'test' } },
        orderBy: { createdAt: Prisma.SortOrder.desc },
      };

      const result = await service.findManyUsers(params);

      expect(userModel.findMany).toHaveBeenCalledWith(params);
      expect(result).toStrictEqual(mockUsers);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
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

      const mockUser = buildUserResponseDto();
      const mockUser2 = buildUserResponseDto();
      const params = [
        { email: mockUser.email, name: mockUser.name },
        { email: mockUser2.email, name: mockUser2.name },
      ];
      const mockUsers = [mockUser, mockUser2];
      userModel.createManyAndReturn.mockResolvedValue(mockUsers);

      const result = await service.createManyAndReturnUsers(params);

      expect(userModel.createManyAndReturn).toHaveBeenCalledWith({
        data: params,
      });
      expect(result).toStrictEqual(mockUsers);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      userModel.update.mockResolvedValue(updatedUser);
      const params = {
        where: { publicId: mockUser.publicId },
        data: { name: 'Updated Name' },
      };

      const result = await service.updateUser(params);

      expect(userModel.update).toHaveBeenCalledWith(params);
      expect(result).toStrictEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      userModel.delete.mockResolvedValue(mockUser);
      const params = { publicId: mockUser.publicId };

      await service.deleteUser(params);

      expect(userModel.delete).toHaveBeenCalledWith({
        where: params,
      });
      expect(userModel.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteManyUsers', () => {
    it('should delete many users', async () => {
      expect.assertions(2);

      userModel.deleteMany.mockResolvedValue({ count: 2 });
      const params = { email: { contains: 'test' } };

      await service.deleteManyUsers(params);

      expect(userModel.deleteMany).toHaveBeenCalledWith({
        where: params,
      });
      expect(userModel.deleteMany).toHaveBeenCalledTimes(1);
    });
  });
});
