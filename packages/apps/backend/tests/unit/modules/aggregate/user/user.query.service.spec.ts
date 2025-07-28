import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import {
  toActiveUserDto,
  toActiveUsersDto,
  toAnyUserDto,
  toAnyUsersDto,
  toDeletedUserDto,
  toDeletedUsersDto,
} from '@/modules/aggregate/user/user.response.dto';

describe('userQueryService', () => {
  let service: UserQueryService;
  let repository: jest.Mocked<UserRepositoryService>;

  const mockUser = {
    id: 1,
    publicId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockDeletedUser = {
    ...mockUser,
    deletedAt: new Date('2024-01-02'),
  };

  beforeEach(async () => {
    const mockRepository: jest.Mocked<UserRepositoryService> = {
      findUniqueActiveUser: jest.fn(),
      findUniqueDeletedUser: jest.fn(),
      findUniqueAnyUser: jest.fn(),
      findManyActiveUsers: jest.fn(),
      findManyDeletedUsers: jest.fn(),
      findManyAnyUsers: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserQueryService,
        {
          provide: UserRepositoryService,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserQueryService>(UserQueryService);
    repository = module.get(UserRepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByIdOrFail', () => {
    it('should return active user when found', async () => {
      expect.assertions(2);

      repository.findUniqueActiveUser.mockResolvedValue(mockUser);
      const dto = { publicId: mockUser.publicId };

      const result = await service.findUserByIdOrFail(dto);

      expect(repository.findUniqueActiveUser).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(toActiveUserDto(mockUser));
    });

    it('should throw NotFoundException when user not found', async () => {
      expect.assertions(2);

      repository.findUniqueActiveUser.mockResolvedValue(null);
      const dto = { publicId: mockUser.publicId };

      await expect(service.findUserByIdOrFail(dto)).rejects.toThrow(
        new NotFoundException(`User ${dto.publicId} not found`),
      );
      expect(repository.findUniqueActiveUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('findDeletedUserByIdOrFail', () => {
    it('should return deleted user when found', async () => {
      expect.assertions(2);

      repository.findUniqueDeletedUser.mockResolvedValue(mockDeletedUser);
      const dto = { publicId: mockDeletedUser.publicId };

      const result = await service.findDeletedUserByIdOrFail(dto);

      expect(repository.findUniqueDeletedUser).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(toDeletedUserDto(mockDeletedUser));
    });

    it('should throw NotFoundException when deleted user not found', async () => {
      expect.assertions(2);

      repository.findUniqueDeletedUser.mockResolvedValue(null);
      const dto = { publicId: mockUser.publicId };

      await expect(service.findDeletedUserByIdOrFail(dto)).rejects.toThrow(
        new NotFoundException(`Deleted user ${dto.publicId} not found`),
      );
      expect(repository.findUniqueDeletedUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAnyUserByIdOrFail', () => {
    it('should return any user when found', async () => {
      expect.assertions(2);

      repository.findUniqueAnyUser.mockResolvedValue(mockUser);
      const dto = { publicId: mockUser.publicId };

      const result = await service.findAnyUserByIdOrFail(dto);

      expect(repository.findUniqueAnyUser).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(toAnyUserDto(mockUser));
    });

    it('should throw NotFoundException when any user not found', async () => {
      expect.assertions(2);

      repository.findUniqueAnyUser.mockResolvedValue(null);
      const dto = { publicId: mockUser.publicId };

      await expect(service.findAnyUserByIdOrFail(dto)).rejects.toThrow(
        new NotFoundException(`User ${dto.publicId} not found`),
      );
      expect(repository.findUniqueAnyUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('findManyUsers', () => {
    it('should return active users when found', async () => {
      expect.assertions(2);

      const mockUsers = [mockUser];
      repository.findManyActiveUsers.mockResolvedValue(mockUsers);
      const dto = { publicIds: [mockUser.publicId] };

      const result = await service.findManyUsers(dto);

      expect(repository.findManyActiveUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toActiveUsersDto(mockUsers));
    });

    it('should return empty array when no users found', async () => {
      expect.assertions(2);

      repository.findManyActiveUsers.mockResolvedValue([]);
      const dto = { publicIds: [mockUser.publicId] };

      const result = await service.findManyUsers(dto);

      expect(repository.findManyActiveUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toActiveUsersDto([]));
    });
  });

  describe('findManyDeletedUsers', () => {
    it('should return deleted users when found', async () => {
      expect.assertions(2);

      const mockUsers = [mockDeletedUser];
      repository.findManyDeletedUsers.mockResolvedValue(mockUsers);
      const dto = { publicIds: [mockDeletedUser.publicId] };

      const result = await service.findManyDeletedUsers(dto);

      expect(repository.findManyDeletedUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toDeletedUsersDto(mockUsers));
    });

    it('should return empty array when no deleted users found', async () => {
      expect.assertions(2);

      repository.findManyDeletedUsers.mockResolvedValue([]);
      const dto = { publicIds: [mockDeletedUser.publicId] };

      const result = await service.findManyDeletedUsers(dto);

      expect(repository.findManyDeletedUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toDeletedUsersDto([]));
    });
  });

  describe('findManyAnyUsers', () => {
    it('should return any users when found', async () => {
      expect.assertions(2);

      const mockUsers = [mockUser, mockDeletedUser];
      repository.findManyAnyUsers.mockResolvedValue(mockUsers);
      const dto = { publicIds: [mockUser.publicId, mockDeletedUser.publicId] };

      const result = await service.findManyAnyUsers(dto);

      expect(repository.findManyAnyUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toAnyUsersDto(mockUsers));
    });

    it('should return empty array when no any users found', async () => {
      expect.assertions(2);

      repository.findManyAnyUsers.mockResolvedValue([]);
      const dto = { publicIds: [mockUser.publicId] };

      const result = await service.findManyAnyUsers(dto);

      expect(repository.findManyAnyUsers).toHaveBeenCalledWith({
        where: { publicId: { in: dto.publicIds } },
      });
      expect(result).toStrictEqual(toAnyUsersDto([]));
    });
  });
});
