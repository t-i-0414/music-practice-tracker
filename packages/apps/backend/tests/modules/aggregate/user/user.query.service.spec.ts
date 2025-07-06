import { NotFoundException } from '@nestjs/common';
import { type TestingModule } from '@nestjs/testing';

import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import * as ResponseDtoModule from '@/modules/aggregate/user/user.response.dto';
import {
  activeUserFixture,
  createMockUserRepositoryService,
  createTestModule,
  createUserEntity,
  deletedUserFixture,
  USER_FIXTURE_IDS,
} from '@/tests/helpers';

jest.mock('@/modules/aggregate/user/user.response.dto', () => ({
  toActiveUserDto: jest.fn(),
  toDeletedUserDto: jest.fn(),
  toAnyUserDto: jest.fn(),
  toActiveUsersDto: jest.fn(),
  toDeletedUsersDto: jest.fn(),
  toAnyUsersDto: jest.fn(),
}));

describe('UserQueryService', () => {
  let service: UserQueryService;
  let mockRepositoryService: ReturnType<typeof createMockUserRepositoryService>;

  const activeUserFixtureEntity = createUserEntity({
    id: USER_FIXTURE_IDS.ACTIVE,
    name: activeUserFixture.name,
    email: activeUserFixture.email,
    createdAt: activeUserFixture.createdAt,
    updatedAt: activeUserFixture.updatedAt,
    deletedAt: null,
  });

  const deletedUserFixtureEntity = createUserEntity({
    id: USER_FIXTURE_IDS.DELETED,
    name: deletedUserFixture.name,
    email: deletedUserFixture.email,
    createdAt: deletedUserFixture.createdAt,
    updatedAt: deletedUserFixture.updatedAt,
    deletedAt: deletedUserFixture.deletedAt,
  });

  beforeEach(async () => {
    mockRepositoryService = createMockUserRepositoryService();

    const module: TestingModule = await createTestModule({
      providers: [
        UserQueryService,
        {
          provide: UserRepositoryService,
          useValue: mockRepositoryService,
        },
      ],
    });

    service = module.get<UserQueryService>(UserQueryService);
  });

  describe('findUserByIdOrFail', () => {
    const mockDto = { id: USER_FIXTURE_IDS.ACTIVE };
    const mockResponseDto = { id: USER_FIXTURE_IDS.ACTIVE, name: activeUserFixture.name };

    it('should return active user when found', async () => {
      mockRepositoryService.findUniqueActiveUser.mockResolvedValue(activeUserFixtureEntity);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await service.findUserByIdOrFail(mockDto);

      expect(mockRepositoryService.findUniqueActiveUser).toHaveBeenCalledWith(mockDto);
      expect(ResponseDtoModule.toActiveUserDto).toHaveBeenCalledWith(activeUserFixtureEntity);
      expect(result).toBe(mockResponseDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepositoryService.findUniqueActiveUser.mockResolvedValue(null);

      await expect(service.findUserByIdOrFail(mockDto)).rejects.toThrow(NotFoundException);
      await expect(service.findUserByIdOrFail(mockDto)).rejects.toThrow(`User ${mockDto.id} not found`);

      expect(mockRepositoryService.findUniqueActiveUser).toHaveBeenCalledWith(mockDto);
      expect(ResponseDtoModule.toActiveUserDto).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepositoryService.findUniqueActiveUser.mockRejectedValue(error);

      await expect(service.findUserByIdOrFail(mockDto)).rejects.toThrow(error);
      expect(ResponseDtoModule.toActiveUserDto).not.toHaveBeenCalled();
    });
  });

  describe('findDeletedUserByIdOrFail', () => {
    const mockDto = { id: USER_FIXTURE_IDS.DELETED };
    const mockResponseDto = {
      id: deletedUserFixture.id,
      name: deletedUserFixture.name,
      deletedAt: deletedUserFixture.deletedAt,
    };

    it('should return deleted user when found', async () => {
      mockRepositoryService.findUniqueDeletedUser.mockResolvedValue(deletedUserFixtureEntity);
      (ResponseDtoModule.toDeletedUserDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await service.findDeletedUserByIdOrFail(mockDto);

      expect(mockRepositoryService.findUniqueDeletedUser).toHaveBeenCalledWith(mockDto);
      expect(ResponseDtoModule.toDeletedUserDto).toHaveBeenCalledWith(deletedUserFixtureEntity);
      expect(result).toBe(mockResponseDto);
    });

    it('should throw NotFoundException when deleted user not found', async () => {
      mockRepositoryService.findUniqueDeletedUser.mockResolvedValue(null);

      await expect(service.findDeletedUserByIdOrFail(mockDto)).rejects.toThrow(NotFoundException);
      await expect(service.findDeletedUserByIdOrFail(mockDto)).rejects.toThrow(`Deleted user ${mockDto.id} not found`);

      expect(mockRepositoryService.findUniqueDeletedUser).toHaveBeenCalledWith(mockDto);
      expect(ResponseDtoModule.toDeletedUserDto).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepositoryService.findUniqueDeletedUser.mockRejectedValue(error);

      await expect(service.findDeletedUserByIdOrFail(mockDto)).rejects.toThrow(error);
      expect(ResponseDtoModule.toDeletedUserDto).not.toHaveBeenCalled();
    });
  });

  describe('findAnyUserByIdOrFail', () => {
    const mockDto = { id: USER_FIXTURE_IDS.ACTIVE };
    const mockResponseDto = {
      id: activeUserFixture.id,
      name: activeUserFixture.name,
      deletedAt: null,
    };

    it('should return active user when found', async () => {
      mockRepositoryService.findUniqueAnyUser.mockResolvedValue(activeUserFixtureEntity);
      (ResponseDtoModule.toAnyUserDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await service.findAnyUserByIdOrFail(mockDto);

      expect(mockRepositoryService.findUniqueAnyUser).toHaveBeenCalledWith(mockDto);
      expect(ResponseDtoModule.toAnyUserDto).toHaveBeenCalledWith(activeUserFixtureEntity);
      expect(result).toBe(mockResponseDto);
    });

    it('should return deleted user when found', async () => {
      const deletedResponseDto = {
        id: deletedUserFixture.id,
        name: deletedUserFixture.name,
        deletedAt: deletedUserFixture.deletedAt,
      };
      mockRepositoryService.findUniqueAnyUser.mockResolvedValue(deletedUserFixtureEntity);
      (ResponseDtoModule.toAnyUserDto as jest.Mock).mockReturnValue(deletedResponseDto);

      const result = await service.findAnyUserByIdOrFail({ id: USER_FIXTURE_IDS.DELETED });

      expect(mockRepositoryService.findUniqueAnyUser).toHaveBeenCalledWith({ id: USER_FIXTURE_IDS.DELETED });
      expect(ResponseDtoModule.toAnyUserDto).toHaveBeenCalledWith(deletedUserFixtureEntity);
      expect(result).toBe(deletedResponseDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepositoryService.findUniqueAnyUser.mockResolvedValue(null);

      await expect(service.findAnyUserByIdOrFail(mockDto)).rejects.toThrow(NotFoundException);
      await expect(service.findAnyUserByIdOrFail(mockDto)).rejects.toThrow(`User ${mockDto.id} not found`);

      expect(mockRepositoryService.findUniqueAnyUser).toHaveBeenCalledWith(mockDto);
      expect(ResponseDtoModule.toAnyUserDto).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepositoryService.findUniqueAnyUser.mockRejectedValue(error);

      await expect(service.findAnyUserByIdOrFail(mockDto)).rejects.toThrow(error);
      expect(ResponseDtoModule.toAnyUserDto).not.toHaveBeenCalled();
    });
  });

  describe('findManyUsers', () => {
    const mockDto = { ids: ['id1', 'id2', 'id3'] };
    const mockUsers = [createUserEntity({ id: 'id1' }), createUserEntity({ id: 'id2' })];
    const mockResponseDto = { users: mockUsers };

    it('should return active users when found', async () => {
      mockRepositoryService.findManyActiveUsers.mockResolvedValue(mockUsers);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await service.findManyUsers(mockDto);

      expect(mockRepositoryService.findManyActiveUsers).toHaveBeenCalledWith({
        where: { id: { in: mockDto.ids } },
      });
      expect(ResponseDtoModule.toActiveUsersDto).toHaveBeenCalledWith(mockUsers);
      expect(result).toBe(mockResponseDto);
    });

    it('should return empty array when no users found', async () => {
      const emptyResponseDto = { users: [] };
      mockRepositoryService.findManyActiveUsers.mockResolvedValue([]);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue(emptyResponseDto);

      const result = await service.findManyUsers(mockDto);

      expect(mockRepositoryService.findManyActiveUsers).toHaveBeenCalledWith({
        where: { id: { in: mockDto.ids } },
      });
      expect(ResponseDtoModule.toActiveUsersDto).toHaveBeenCalledWith([]);
      expect(result).toBe(emptyResponseDto);
    });

    it('should handle empty ids array', async () => {
      const emptyDto = { ids: [] };
      const emptyResponseDto = { users: [] };
      mockRepositoryService.findManyActiveUsers.mockResolvedValue([]);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue(emptyResponseDto);

      const result = await service.findManyUsers(emptyDto);

      expect(mockRepositoryService.findManyActiveUsers).toHaveBeenCalledWith({
        where: { id: { in: [] } },
      });
      expect(result).toBe(emptyResponseDto);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepositoryService.findManyActiveUsers.mockRejectedValue(error);

      await expect(service.findManyUsers(mockDto)).rejects.toThrow(error);
      expect(ResponseDtoModule.toActiveUsersDto).not.toHaveBeenCalled();
    });
  });

  describe('findManyDeletedUsers', () => {
    const mockDto = { ids: ['id1', 'id2', 'id3'] };
    const mockUsers = [
      createUserEntity({ id: 'id1', deletedAt: new Date('2024-01-03') }),
      createUserEntity({ id: 'id2', deletedAt: new Date('2024-01-03') }),
    ];
    const mockResponseDto = { users: mockUsers };

    it('should return deleted users when found', async () => {
      mockRepositoryService.findManyDeletedUsers.mockResolvedValue(mockUsers);
      (ResponseDtoModule.toDeletedUsersDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await service.findManyDeletedUsers(mockDto);

      expect(mockRepositoryService.findManyDeletedUsers).toHaveBeenCalledWith({
        where: { id: { in: mockDto.ids } },
      });
      expect(ResponseDtoModule.toDeletedUsersDto).toHaveBeenCalledWith(mockUsers);
      expect(result).toBe(mockResponseDto);
    });

    it('should return empty array when no deleted users found', async () => {
      const emptyResponseDto = { users: [] };
      mockRepositoryService.findManyDeletedUsers.mockResolvedValue([]);
      (ResponseDtoModule.toDeletedUsersDto as jest.Mock).mockReturnValue(emptyResponseDto);

      const result = await service.findManyDeletedUsers(mockDto);

      expect(mockRepositoryService.findManyDeletedUsers).toHaveBeenCalledWith({
        where: { id: { in: mockDto.ids } },
      });
      expect(ResponseDtoModule.toDeletedUsersDto).toHaveBeenCalledWith([]);
      expect(result).toBe(emptyResponseDto);
    });

    it('should handle empty ids array', async () => {
      const emptyDto = { ids: [] };
      const emptyResponseDto = { users: [] };
      mockRepositoryService.findManyDeletedUsers.mockResolvedValue([]);
      (ResponseDtoModule.toDeletedUsersDto as jest.Mock).mockReturnValue(emptyResponseDto);

      const result = await service.findManyDeletedUsers(emptyDto);

      expect(mockRepositoryService.findManyDeletedUsers).toHaveBeenCalledWith({
        where: { id: { in: [] } },
      });
      expect(result).toBe(emptyResponseDto);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepositoryService.findManyDeletedUsers.mockRejectedValue(error);

      await expect(service.findManyDeletedUsers(mockDto)).rejects.toThrow(error);
      expect(ResponseDtoModule.toDeletedUsersDto).not.toHaveBeenCalled();
    });
  });

  describe('findManyAnyUsers', () => {
    const mockDto = { ids: ['id1', 'id2', 'id3'] };
    const mockUsers = [
      createUserEntity({ id: 'id1' }),
      createUserEntity({ id: 'id2', deletedAt: new Date('2024-01-03') }),
    ];
    const mockResponseDto = { users: mockUsers };

    it('should return all users (active and deleted) when found', async () => {
      mockRepositoryService.findManyAnyUsers.mockResolvedValue(mockUsers);
      (ResponseDtoModule.toAnyUsersDto as jest.Mock).mockReturnValue(mockResponseDto);

      const result = await service.findManyAnyUsers(mockDto);

      expect(mockRepositoryService.findManyAnyUsers).toHaveBeenCalledWith({
        where: { id: { in: mockDto.ids } },
      });
      expect(ResponseDtoModule.toAnyUsersDto).toHaveBeenCalledWith(mockUsers);
      expect(result).toBe(mockResponseDto);
    });

    it('should return empty array when no users found', async () => {
      const emptyResponseDto = { users: [] };
      mockRepositoryService.findManyAnyUsers.mockResolvedValue([]);
      (ResponseDtoModule.toAnyUsersDto as jest.Mock).mockReturnValue(emptyResponseDto);

      const result = await service.findManyAnyUsers(mockDto);

      expect(mockRepositoryService.findManyAnyUsers).toHaveBeenCalledWith({
        where: { id: { in: mockDto.ids } },
      });
      expect(ResponseDtoModule.toAnyUsersDto).toHaveBeenCalledWith([]);
      expect(result).toBe(emptyResponseDto);
    });

    it('should handle empty ids array', async () => {
      const emptyDto = { ids: [] };
      const emptyResponseDto = { users: [] };
      mockRepositoryService.findManyAnyUsers.mockResolvedValue([]);
      (ResponseDtoModule.toAnyUsersDto as jest.Mock).mockReturnValue(emptyResponseDto);

      const result = await service.findManyAnyUsers(emptyDto);

      expect(mockRepositoryService.findManyAnyUsers).toHaveBeenCalledWith({
        where: { id: { in: [] } },
      });
      expect(result).toBe(emptyResponseDto);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepositoryService.findManyAnyUsers.mockRejectedValue(error);

      await expect(service.findManyAnyUsers(mockDto)).rejects.toThrow(error);
      expect(ResponseDtoModule.toAnyUsersDto).not.toHaveBeenCalled();
    });
  });

  describe('Error handling patterns', () => {
    it('should preserve stack trace when repository throws', async () => {
      const error = new Error('Database connection lost');
      error.stack = 'Original stack trace';
      mockRepositoryService.findUniqueActiveUser.mockRejectedValue(error);

      try {
        await service.findUserByIdOrFail({ id: 'test-id' });
      } catch (e: any) {
        expect(e).toBe(error);
        expect(e.stack).toBe('Original stack trace');
      }
    });

    it('should handle concurrent requests properly', async () => {
      const dto1 = { id: 'id1' };
      const dto2 = { id: 'id2' };
      const user1 = createUserEntity({ id: 'id1' });
      const user2 = createUserEntity({ id: 'id2' });

      mockRepositoryService.findUniqueActiveUser.mockResolvedValueOnce(user1).mockResolvedValueOnce(user2);

      (ResponseDtoModule.toActiveUserDto as jest.Mock)
        .mockReturnValueOnce({ id: 'id1' })
        .mockReturnValueOnce({ id: 'id2' });

      const [result1, result2] = await Promise.all([
        service.findUserByIdOrFail(dto1),
        service.findUserByIdOrFail(dto2),
      ]);

      expect(result1.id).toBe('id1');
      expect(result2.id).toBe('id2');
      expect(mockRepositoryService.findUniqueActiveUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration patterns', () => {
    it('should handle large batch queries efficiently', async () => {
      const largeIds = Array.from({ length: 1000 }, (_, i) => `id${i}`);
      const mockDto = { ids: largeIds };
      const mockUsers = largeIds.slice(0, 500).map((id) => createUserEntity({ id }));

      mockRepositoryService.findManyActiveUsers.mockResolvedValue(mockUsers);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue({ users: mockUsers });

      const result = await service.findManyUsers(mockDto);

      expect(mockRepositoryService.findManyActiveUsers).toHaveBeenCalledWith({
        where: { id: { in: largeIds } },
      });
      expect(result.users).toHaveLength(500);
    });

    it('should maintain data consistency across different find methods', async () => {
      const userId = 'consistent-id';
      const consistentUser = createUserEntity({ id: userId });

      // Setup all methods to return the same user
      mockRepositoryService.findUniqueActiveUser.mockResolvedValue(consistentUser);
      mockRepositoryService.findUniqueAnyUser.mockResolvedValue(consistentUser);
      mockRepositoryService.findManyActiveUsers.mockResolvedValue([consistentUser]);
      mockRepositoryService.findManyAnyUsers.mockResolvedValue([consistentUser]);

      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue({ id: userId });
      (ResponseDtoModule.toAnyUserDto as jest.Mock).mockReturnValue({ id: userId });
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue({ users: [{ id: userId }] });
      (ResponseDtoModule.toAnyUsersDto as jest.Mock).mockReturnValue({ users: [{ id: userId }] });

      // Verify all methods return consistent data
      const singleActive = await service.findUserByIdOrFail({ id: userId });
      const singleAny = await service.findAnyUserByIdOrFail({ id: userId });
      const manyActive = await service.findManyUsers({ ids: [userId] });
      const manyAny = await service.findManyAnyUsers({ ids: [userId] });

      expect(singleActive.id).toBe(userId);
      expect(singleAny.id).toBe(userId);
      expect(manyActive.users[0].id).toBe(userId);
      expect(manyAny.users[0].id).toBe(userId);
    });
  });
});
