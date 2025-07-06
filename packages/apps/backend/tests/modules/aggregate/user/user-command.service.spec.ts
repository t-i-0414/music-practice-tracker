import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import * as ResponseDtoModule from '@/modules/aggregate/user/user.response.dto';
import { createUserEntity } from '@/tests/helpers';

jest.mock('@/modules/aggregate/user/user.response.dto', () => ({
  toActiveUserDto: jest.fn(),
  toActiveUsersDto: jest.fn(),
  toDeletedUserDto: jest.fn(),
  toDeletedUsersDto: jest.fn(),
  toAnyUserDto: jest.fn(),
  toAnyUsersDto: jest.fn(),
}));

describe('UserCommandService', () => {
  let service: UserCommandService;
  let repositoryService: jest.Mocked<UserRepositoryService>;
  let queryService: jest.Mocked<UserQueryService>;

  const activeUserFixtureDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const activeUserFixturesDto = {
    users: [activeUserFixtureDto],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCommandService,
        {
          provide: UserRepositoryService,
          useValue: {
            createUser: jest.fn(),
            createManyAndReturnUsers: jest.fn(),
            updateUser: jest.fn(),
            updateManyAndReturn: jest.fn(),
            deleteUser: jest.fn(),
            deleteManyUsers: jest.fn(),
            hardDeleteUser: jest.fn(),
            hardDeleteManyUsers: jest.fn(),
            restoreUser: jest.fn(),
            restoreManyAndReturnUsers: jest.fn(),
          },
        },
        {
          provide: UserQueryService,
          useValue: {
            findUserByIdOrFail: jest.fn(),
            findDeletedUserByIdOrFail: jest.fn(),
            findAnyUserByIdOrFail: jest.fn(),
            findManyUsers: jest.fn(),
            findManyDeletedUsers: jest.fn(),
            findManyAnyUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserCommandService>(UserCommandService);
    repositoryService = module.get(UserRepositoryService);
    queryService = module.get(UserQueryService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all required dependencies', () => {
      expect(repositoryService).toBeDefined();
      expect(queryService).toBeDefined();
    });
  });

  describe('createUser', () => {
    const createUserInputFixture = {
      name: 'New User',
      email: 'new@example.com',
    };

    it('should create a user and return mapped DTO', async () => {
      const createdUser = createUserEntity({
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createUserInputFixture,
      });

      repositoryService.createUser.mockResolvedValue(createdUser);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(activeUserFixtureDto);

      const result = await service.createUser(createUserInputFixture);

      expect(repositoryService.createUser).toHaveBeenCalledWith(createUserInputFixture);
      expect(repositoryService.createUser).toHaveBeenCalledTimes(1);
      expect(ResponseDtoModule.toActiveUserDto).toHaveBeenCalledWith(createdUser);
      expect(result).toBe(activeUserFixtureDto);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      repositoryService.createUser.mockRejectedValue(error);

      await expect(service.createUser(createUserInputFixture)).rejects.toThrow(error);
      expect(ResponseDtoModule.toActiveUserDto).not.toHaveBeenCalled();
    });

    it('should handle duplicate email errors', async () => {
      const duplicateError = new Error('Unique constraint violation');
      repositoryService.createUser.mockRejectedValue(duplicateError);

      await expect(service.createUser(createUserInputFixture)).rejects.toThrow(duplicateError);
    });

    it('should pass through all user properties', async () => {
      const detailedInput = {
        name: 'Detailed User',
        email: 'detailed@example.com',
      };

      const createdUser = createUserEntity(detailedInput);
      repositoryService.createUser.mockResolvedValue(createdUser);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(activeUserFixtureDto);

      await service.createUser(detailedInput);

      expect(repositoryService.createUser).toHaveBeenCalledWith(detailedInput);
    });
  });

  describe('createManyAndReturnUsers', () => {
    const createManyInput = {
      users: [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
      ],
    };

    it('should create multiple users and return mapped DTOs', async () => {
      const createdUsers = createManyInput.users.map((user, index) =>
        createUserEntity({
          id: `id-${index}`,
          ...user,
        }),
      );

      repositoryService.createManyAndReturnUsers.mockResolvedValue(createdUsers);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue(activeUserFixturesDto);

      const result = await service.createManyAndReturnUsers(createManyInput);

      expect(repositoryService.createManyAndReturnUsers).toHaveBeenCalledWith(createManyInput.users);
      expect(repositoryService.createManyAndReturnUsers).toHaveBeenCalledTimes(1);
      expect(ResponseDtoModule.toActiveUsersDto).toHaveBeenCalledWith(createdUsers);
      expect(result).toBe(activeUserFixturesDto);
    });

    it('should handle empty array', async () => {
      const emptyInput = { users: [] };
      repositoryService.createManyAndReturnUsers.mockResolvedValue([]);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue({ users: [] });

      const result = await service.createManyAndReturnUsers(emptyInput);

      expect(repositoryService.createManyAndReturnUsers).toHaveBeenCalledWith([]);
      expect(result).toEqual({ users: [] });
    });

    it('should handle large batches', async () => {
      const largeInput = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          name: `User ${i}`,
          email: `user${i}@example.com`,
        })),
      };

      const createdUsers = largeInput.users.map((user, i) => createUserEntity({ id: `id-${i}`, ...user }));

      repositoryService.createManyAndReturnUsers.mockResolvedValue(createdUsers);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue({ users: createdUsers });

      const result = await service.createManyAndReturnUsers(largeInput);

      expect(repositoryService.createManyAndReturnUsers).toHaveBeenCalledWith(largeInput.users);
      expect(result.users).toHaveLength(1000);
    });

    it('should handle partial failures', async () => {
      const error = new Error('Some users could not be created');
      repositoryService.createManyAndReturnUsers.mockRejectedValue(error);

      await expect(service.createManyAndReturnUsers(createManyInput)).rejects.toThrow(error);
      expect(ResponseDtoModule.toActiveUsersDto).not.toHaveBeenCalled();
    });
  });

  describe('updateUserById', () => {
    const updateInput = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        name: 'Updated Name',
      },
    };

    it('should verify user exists then update and return mapped DTO', async () => {
      const existingUser = createUserEntity({ id: updateInput.id });
      const updatedUser = { ...existingUser, ...updateInput.data };

      queryService.findUserByIdOrFail.mockResolvedValue(existingUser);
      repositoryService.updateUser.mockResolvedValue(updatedUser);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(activeUserFixtureDto);

      const result = await service.updateUserById(updateInput);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ id: updateInput.id });
      expect(queryService.findUserByIdOrFail).toHaveBeenCalledTimes(1);
      expect(repositoryService.updateUser).toHaveBeenCalledWith({
        where: { id: updateInput.id },
        data: updateInput.data,
      });
      expect(ResponseDtoModule.toActiveUserDto).toHaveBeenCalledWith(updatedUser);
      expect(result).toBe(activeUserFixtureDto);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const notFoundError = new NotFoundException('User not found');
      queryService.findUserByIdOrFail.mockRejectedValue(notFoundError);

      await expect(service.updateUserById(updateInput)).rejects.toThrow(notFoundError);
      expect(repositoryService.updateUser).not.toHaveBeenCalled();
      expect(ResponseDtoModule.toActiveUserDto).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const partialUpdateInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          email: 'newemail@example.com',
        },
      };

      const existingUser = createUserEntity({ id: partialUpdateInput.id });
      const updatedUser = { ...existingUser, ...partialUpdateInput.data };

      queryService.findUserByIdOrFail.mockResolvedValue(existingUser);
      repositoryService.updateUser.mockResolvedValue(updatedUser);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(activeUserFixtureDto);

      await service.updateUserById(partialUpdateInput);

      expect(repositoryService.updateUser).toHaveBeenCalledWith({
        where: { id: partialUpdateInput.id },
        data: partialUpdateInput.data,
      });
    });

    it('should handle empty data object', async () => {
      const emptyUpdateInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        data: {},
      };

      const existingUser = createUserEntity({ id: emptyUpdateInput.id });
      queryService.findUserByIdOrFail.mockResolvedValue(existingUser);
      repositoryService.updateUser.mockResolvedValue(existingUser);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(activeUserFixtureDto);

      await service.updateUserById(emptyUpdateInput);

      expect(repositoryService.updateUser).toHaveBeenCalledWith({
        where: { id: emptyUpdateInput.id },
        data: {},
      });
    });

    it('should handle repository update errors', async () => {
      const existingUser = createUserEntity({ id: updateInput.id });
      queryService.findUserByIdOrFail.mockResolvedValue(existingUser);

      const updateError = new Error('Update failed');
      repositoryService.updateUser.mockRejectedValue(updateError);

      await expect(service.updateUserById(updateInput)).rejects.toThrow(updateError);
      expect(ResponseDtoModule.toActiveUserDto).not.toHaveBeenCalled();
    });
  });

  describe('deleteUserById', () => {
    const deleteInput = { id: '123e4567-e89b-12d3-a456-426614174000' };

    it('should soft delete a user', async () => {
      repositoryService.deleteUser.mockResolvedValue(undefined);

      await service.deleteUserById(deleteInput);

      expect(repositoryService.deleteUser).toHaveBeenCalledWith({ id: deleteInput.id });
      expect(repositoryService.deleteUser).toHaveBeenCalledTimes(1);
    });

    it('should not check if user exists before deletion', async () => {
      repositoryService.deleteUser.mockResolvedValue(undefined);

      await service.deleteUserById(deleteInput);

      expect(queryService.findUserByIdOrFail).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Delete failed');
      repositoryService.deleteUser.mockRejectedValue(error);

      await expect(service.deleteUserById(deleteInput)).rejects.toThrow(error);
    });

    it('should handle non-existent user deletion gracefully', async () => {
      repositoryService.deleteUser.mockResolvedValue(undefined);

      await expect(service.deleteUserById({ id: 'non-existent' })).resolves.toBeUndefined();
    });
  });

  describe('deleteManyUsersById', () => {
    const deleteManyInput = {
      ids: ['id1', 'id2', 'id3'],
    };

    it('should soft delete multiple users', async () => {
      repositoryService.deleteManyUsers.mockResolvedValue(undefined);

      await service.deleteManyUsersById(deleteManyInput);

      expect(repositoryService.deleteManyUsers).toHaveBeenCalledWith({
        id: { in: deleteManyInput.ids },
      });
      expect(repositoryService.deleteManyUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle empty array', async () => {
      repositoryService.deleteManyUsers.mockResolvedValue(undefined);

      await service.deleteManyUsersById({ ids: [] });

      expect(repositoryService.deleteManyUsers).toHaveBeenCalledWith({
        id: { in: [] },
      });
    });

    it('should handle large batches', async () => {
      const largeIds = Array.from({ length: 1000 }, (_, i) => `id-${i}`);
      repositoryService.deleteManyUsers.mockResolvedValue(undefined);

      await service.deleteManyUsersById({ ids: largeIds });

      expect(repositoryService.deleteManyUsers).toHaveBeenCalledWith({
        id: { in: largeIds },
      });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Batch delete failed');
      repositoryService.deleteManyUsers.mockRejectedValue(error);

      await expect(service.deleteManyUsersById(deleteManyInput)).rejects.toThrow(error);
    });
  });

  describe('hardDeleteUserById', () => {
    const hardDeleteInput = { id: '123e4567-e89b-12d3-a456-426614174000' };

    it('should permanently delete a user', async () => {
      repositoryService.hardDeleteUser.mockResolvedValue(undefined);

      await service.hardDeleteUserById(hardDeleteInput);

      expect(repositoryService.hardDeleteUser).toHaveBeenCalledWith({ id: hardDeleteInput.id });
      expect(repositoryService.hardDeleteUser).toHaveBeenCalledTimes(1);
    });

    it('should not use soft delete method', async () => {
      repositoryService.hardDeleteUser.mockResolvedValue(undefined);

      await service.hardDeleteUserById(hardDeleteInput);

      expect(repositoryService.deleteUser).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Hard delete failed');
      repositoryService.hardDeleteUser.mockRejectedValue(error);

      await expect(service.hardDeleteUserById(hardDeleteInput)).rejects.toThrow(error);
    });
  });

  describe('hardDeleteManyUsersById', () => {
    const hardDeleteManyInput = {
      ids: ['id1', 'id2', 'id3'],
    };

    it('should permanently delete multiple users', async () => {
      repositoryService.hardDeleteManyUsers.mockResolvedValue(undefined);

      await service.hardDeleteManyUsersById(hardDeleteManyInput);

      expect(repositoryService.hardDeleteManyUsers).toHaveBeenCalledWith({
        id: { in: hardDeleteManyInput.ids },
      });
      expect(repositoryService.hardDeleteManyUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle empty array', async () => {
      repositoryService.hardDeleteManyUsers.mockResolvedValue(undefined);

      await service.hardDeleteManyUsersById({ ids: [] });

      expect(repositoryService.hardDeleteManyUsers).toHaveBeenCalledWith({
        id: { in: [] },
      });
    });

    it('should not use soft delete method', async () => {
      repositoryService.hardDeleteManyUsers.mockResolvedValue(undefined);

      await service.hardDeleteManyUsersById(hardDeleteManyInput);

      expect(repositoryService.deleteManyUsers).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Batch hard delete failed');
      repositoryService.hardDeleteManyUsers.mockRejectedValue(error);

      await expect(service.hardDeleteManyUsersById(hardDeleteManyInput)).rejects.toThrow(error);
    });
  });

  describe('restoreUserById', () => {
    const restoreInput = { id: '123e4567-e89b-12d3-a456-426614174000' };

    it('should restore a soft-deleted user and return mapped DTO', async () => {
      const restoredUser = createUserEntity({
        id: restoreInput.id,
        deletedAt: null,
      });

      repositoryService.restoreUser.mockResolvedValue(restoredUser);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(activeUserFixtureDto);

      const result = await service.restoreUserById(restoreInput);

      expect(repositoryService.restoreUser).toHaveBeenCalledWith({ id: restoreInput.id });
      expect(repositoryService.restoreUser).toHaveBeenCalledTimes(1);
      expect(ResponseDtoModule.toActiveUserDto).toHaveBeenCalledWith(restoredUser);
      expect(result).toBe(activeUserFixtureDto);
    });

    it('should handle non-existent user restoration', async () => {
      const error = new Error('User not found');
      repositoryService.restoreUser.mockRejectedValue(error);

      await expect(service.restoreUserById(restoreInput)).rejects.toThrow(error);
      expect(ResponseDtoModule.toActiveUserDto).not.toHaveBeenCalled();
    });

    it('should handle already active user restoration', async () => {
      const activeUser = createUserEntity({
        id: restoreInput.id,
        deletedAt: null,
      });

      repositoryService.restoreUser.mockResolvedValue(activeUser);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(activeUserFixtureDto);

      const result = await service.restoreUserById(restoreInput);

      expect(result).toBe(activeUserFixtureDto);
    });
  });

  describe('restoreManyUsersById', () => {
    const restoreManyInput = {
      ids: ['id1', 'id2', 'id3'],
    };

    it('should restore multiple soft-deleted users and return mapped DTOs', async () => {
      const restoredUsers = restoreManyInput.ids.map((id) =>
        createUserEntity({
          id,
          deletedAt: null,
        }),
      );

      repositoryService.restoreManyAndReturnUsers.mockResolvedValue(restoredUsers);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue(activeUserFixturesDto);

      const result = await service.restoreManyUsersById(restoreManyInput);

      expect(repositoryService.restoreManyAndReturnUsers).toHaveBeenCalledWith({
        id: { in: restoreManyInput.ids },
      });
      expect(repositoryService.restoreManyAndReturnUsers).toHaveBeenCalledTimes(1);
      expect(ResponseDtoModule.toActiveUsersDto).toHaveBeenCalledWith(restoredUsers);
      expect(result).toBe(activeUserFixturesDto);
    });

    it('should handle empty array', async () => {
      repositoryService.restoreManyAndReturnUsers.mockResolvedValue([]);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue({ users: [] });

      const result = await service.restoreManyUsersById({ ids: [] });

      expect(repositoryService.restoreManyAndReturnUsers).toHaveBeenCalledWith({
        id: { in: [] },
      });
      expect(result).toEqual({ users: [] });
    });

    it('should handle partial restoration (some users not found)', async () => {
      const partialRestoredUsers = [
        createUserEntity({ id: 'id1', deletedAt: null }),
        createUserEntity({ id: 'id3', deletedAt: null }),
      ];

      repositoryService.restoreManyAndReturnUsers.mockResolvedValue(partialRestoredUsers);
      (ResponseDtoModule.toActiveUsersDto as jest.Mock).mockReturnValue({
        users: partialRestoredUsers,
      });

      const result = await service.restoreManyUsersById(restoreManyInput);

      expect(result.users).toHaveLength(2);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Batch restore failed');
      repositoryService.restoreManyAndReturnUsers.mockRejectedValue(error);

      await expect(service.restoreManyUsersById(restoreManyInput)).rejects.toThrow(error);
      expect(ResponseDtoModule.toActiveUsersDto).not.toHaveBeenCalled();
    });
  });

  describe('Concurrency and performance', () => {
    it('should handle concurrent create operations', async () => {
      const users = Array.from({ length: 5 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
      }));

      repositoryService.createUser.mockImplementation((input) =>
        Promise.resolve(createUserEntity({ id: `id-${Math.random()}`, name: input.name, email: input.email })),
      );
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockImplementation((user: unknown) => ({
        ...(user as Record<string, unknown>),
        mapped: true,
      }));

      const results = await Promise.all(users.map((user) => service.createUser(user)));

      expect(results).toHaveLength(5);
      expect(repositoryService.createUser).toHaveBeenCalledTimes(5);
      expect(ResponseDtoModule.toActiveUserDto).toHaveBeenCalledTimes(5);
    });

    it('should handle mixed operations concurrently', async () => {
      const user = createUserEntity();

      repositoryService.createUser.mockResolvedValue(user);
      repositoryService.updateUser.mockResolvedValue(user);
      repositoryService.deleteUser.mockResolvedValue(undefined);
      repositoryService.restoreUser.mockResolvedValue(user);
      queryService.findUserByIdOrFail.mockResolvedValue(user);
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockReturnValue(activeUserFixtureDto);

      const [createResult, updateResult, _, restoreResult] = await Promise.all([
        service.createUser({ name: 'Test', email: 'test@example.com' }),
        service.updateUserById({ id: 'id1', data: { name: 'Updated' } }),
        service.deleteUserById({ id: 'id2' }),
        service.restoreUserById({ id: 'id3' }),
      ]);

      expect(createResult).toBe(activeUserFixtureDto);
      expect(updateResult).toBe(activeUserFixtureDto);
      expect(restoreResult).toBe(activeUserFixtureDto);
    });
  });

  describe('Error handling patterns', () => {
    it('should preserve error stack traces', async () => {
      const error = new Error('Test error');
      error.stack = 'Original stack trace';
      repositoryService.createUser.mockRejectedValue(error);

      try {
        await service.createUser({ name: 'Test', email: 'test@example.com' });
        fail('Expected error to be thrown');
      } catch (e: any) {
        expect(e).toBe(error);
        expect(e.stack).toBe('Original stack trace');
      }
    });

    it('should handle null/undefined errors gracefully', async () => {
      repositoryService.createUser.mockRejectedValue(null);

      await expect(service.createUser({ name: 'Test', email: 'test@example.com' })).rejects.toBeNull();
    });

    it('should not mask errors with transformation errors', async () => {
      const user = createUserEntity();
      repositoryService.createUser.mockResolvedValue(user);

      const transformError = new Error('DTO transformation failed');
      (ResponseDtoModule.toActiveUserDto as jest.Mock).mockImplementation(() => {
        throw transformError;
      });

      await expect(service.createUser({ name: 'Test', email: 'test@example.com' })).rejects.toThrow(transformError);
    });
  });

  describe('Integration with repository patterns', () => {
    it('should respect soft delete semantics', async () => {
      await service.deleteUserById({ id: 'test-id' });

      expect(repositoryService.deleteUser).toHaveBeenCalled();
      expect(repositoryService.hardDeleteUser).not.toHaveBeenCalled();
    });

    it('should use correct where clauses for batch operations', async () => {
      const ids = ['id1', 'id2', 'id3'];

      await service.deleteManyUsersById({ ids });
      expect(repositoryService.deleteManyUsers).toHaveBeenCalledWith({
        id: { in: ids },
      });

      await service.hardDeleteManyUsersById({ ids });
      expect(repositoryService.hardDeleteManyUsers).toHaveBeenCalledWith({
        id: { in: ids },
      });

      await service.restoreManyUsersById({ ids });
      expect(repositoryService.restoreManyAndReturnUsers).toHaveBeenCalledWith({
        id: { in: ids },
      });
    });
  });
});
