import { Test, type TestingModule } from '@nestjs/testing';

import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import type {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  DeleteUserByIdInputDto,
  FindManyUsersByIdInputDto,
  FindUserByIdInputDto,
  HardDeleteManyUsersInputDto,
  HardDeleteUserByIdInputDto,
  RestoreManyUsersInputDto,
  RestoreUserByIdInputDto,
  UpdateUserInputDto,
} from '@/modules/aggregate/user/user.input.dto';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import type {
  ActiveUserResponseDto,
  ActiveUsersResponseDto,
  AnyUserResponseDto,
  AnyUsersResponseDto,
  DeletedUserResponseDto,
  DeletedUsersResponseDto,
} from '@/modules/aggregate/user/user.response.dto';

describe('UserAdminFacadeService', () => {
  let service: UserAdminFacadeService;
  let commandService: jest.Mocked<UserCommandService>;
  let queryService: jest.Mocked<UserQueryService>;

  const mockActiveUserResponse: ActiveUserResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const mockDeletedUserResponse: DeletedUserResponseDto = {
    id: '223e4567-e89b-12d3-a456-426614174001',
    name: 'Deleted User',
    email: 'deleted@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    deletedAt: new Date('2024-01-03'),
  };

  const mockAnyUserResponse: AnyUserResponseDto = {
    id: '323e4567-e89b-12d3-a456-426614174002',
    name: 'Any User',
    email: 'any@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    deletedAt: new Date('2024-01-03'),
  };

  const mockActiveUsersResponse: ActiveUsersResponseDto = {
    users: [mockActiveUserResponse],
  };

  const mockDeletedUsersResponse: DeletedUsersResponseDto = {
    users: [mockDeletedUserResponse],
  };

  const mockAnyUsersResponse: AnyUsersResponseDto = {
    users: [mockAnyUserResponse],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAdminFacadeService,
        {
          provide: UserCommandService,
          useValue: {
            createUser: jest.fn(),
            createManyAndReturnUsers: jest.fn(),
            updateUserById: jest.fn(),
            deleteUserById: jest.fn(),
            deleteManyUsersById: jest.fn(),
            hardDeleteUserById: jest.fn(),
            hardDeleteManyUsersById: jest.fn(),
            restoreUserById: jest.fn(),
            restoreManyUsersById: jest.fn(),
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

    service = module.get<UserAdminFacadeService>(UserAdminFacadeService);
    commandService = module.get(UserCommandService);
    queryService = module.get(UserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all required dependencies', () => {
      expect(commandService).toBeDefined();
      expect(queryService).toBeDefined();
    });
  });

  describe('Query Methods', () => {
    describe('findUserById', () => {
      const mockInput: FindUserByIdInputDto = { id: '123e4567-e89b-12d3-a456-426614174000' };

      it('should delegate to UserQueryService.findUserByIdOrFail', async () => {
        queryService.findUserByIdOrFail.mockResolvedValue(mockActiveUserResponse);

        const result = await service.findUserById(mockInput);

        expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith(mockInput);
        expect(queryService.findUserByIdOrFail).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockActiveUserResponse);
      });

      it('should propagate errors from query service', async () => {
        const error = new Error('User not found');
        queryService.findUserByIdOrFail.mockRejectedValue(error);

        await expect(service.findUserById(mockInput)).rejects.toThrow(error);
      });
    });

    describe('findDeletedUserById', () => {
      const mockInput: FindUserByIdInputDto = { id: '223e4567-e89b-12d3-a456-426614174001' };

      it('should delegate to UserQueryService.findDeletedUserByIdOrFail', async () => {
        queryService.findDeletedUserByIdOrFail.mockResolvedValue(mockDeletedUserResponse);

        const result = await service.findDeletedUserById(mockInput);

        expect(queryService.findDeletedUserByIdOrFail).toHaveBeenCalledWith(mockInput);
        expect(queryService.findDeletedUserByIdOrFail).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockDeletedUserResponse);
      });

      it('should return deleted users with deletedAt timestamp', async () => {
        queryService.findDeletedUserByIdOrFail.mockResolvedValue(mockDeletedUserResponse);

        const result = await service.findDeletedUserById(mockInput);

        expect(result.deletedAt).toBeDefined();
        expect(result.deletedAt).toBeInstanceOf(Date);
      });
    });

    describe('findAnyUserById', () => {
      const mockInput: FindUserByIdInputDto = { id: '323e4567-e89b-12d3-a456-426614174002' };

      it('should delegate to UserQueryService.findAnyUserByIdOrFail', async () => {
        queryService.findAnyUserByIdOrFail.mockResolvedValue(mockAnyUserResponse);

        const result = await service.findAnyUserById(mockInput);

        expect(queryService.findAnyUserByIdOrFail).toHaveBeenCalledWith(mockInput);
        expect(queryService.findAnyUserByIdOrFail).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockAnyUserResponse);
      });

      it('should handle users with different deletion dates', async () => {
        const recentlyDeleted: AnyUserResponseDto = {
          ...mockAnyUserResponse,
          deletedAt: new Date('2024-12-01'),
        };
        queryService.findAnyUserByIdOrFail.mockResolvedValue(recentlyDeleted);

        const recentResult = await service.findAnyUserById(mockInput);
        expect(recentResult.deletedAt).toEqual(new Date('2024-12-01'));

        const olderDeleted: AnyUserResponseDto = {
          ...mockAnyUserResponse,
          deletedAt: new Date('2023-01-01'),
        };
        queryService.findAnyUserByIdOrFail.mockResolvedValue(olderDeleted);

        const olderResult = await service.findAnyUserById(mockInput);
        expect(olderResult.deletedAt).toEqual(new Date('2023-01-01'));
      });
    });

    describe('findManyUsers', () => {
      const mockInput: FindManyUsersByIdInputDto = { ids: ['id1', 'id2', 'id3'] };

      it('should delegate to UserQueryService.findManyUsers', async () => {
        queryService.findManyUsers.mockResolvedValue(mockActiveUsersResponse);

        const result = await service.findManyUsers(mockInput);

        expect(queryService.findManyUsers).toHaveBeenCalledWith(mockInput);
        expect(queryService.findManyUsers).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockActiveUsersResponse);
      });

      it('should handle empty results', async () => {
        queryService.findManyUsers.mockResolvedValue({ users: [] });

        const result = await service.findManyUsers(mockInput);

        expect(result.users).toHaveLength(0);
      });
    });

    describe('findManyDeletedUsers', () => {
      const mockInput: FindManyUsersByIdInputDto = { ids: ['id1', 'id2'] };

      it('should delegate to UserQueryService.findManyDeletedUsers', async () => {
        queryService.findManyDeletedUsers.mockResolvedValue(mockDeletedUsersResponse);

        const result = await service.findManyDeletedUsers(mockInput);

        expect(queryService.findManyDeletedUsers).toHaveBeenCalledWith(mockInput);
        expect(queryService.findManyDeletedUsers).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockDeletedUsersResponse);
      });
    });

    describe('findManyAnyUsers', () => {
      const mockInput: FindManyUsersByIdInputDto = { ids: ['id1', 'id2'] };

      it('should delegate to UserQueryService.findManyAnyUsers', async () => {
        queryService.findManyAnyUsers.mockResolvedValue(mockAnyUsersResponse);

        const result = await service.findManyAnyUsers(mockInput);

        expect(queryService.findManyAnyUsers).toHaveBeenCalledWith(mockInput);
        expect(queryService.findManyAnyUsers).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockAnyUsersResponse);
      });
    });
  });

  describe('Command Methods', () => {
    describe('createUser', () => {
      const mockInput: CreateUserInputDto = {
        name: 'New User',
        email: 'new@example.com',
      };

      it('should delegate to UserCommandService.createUser', async () => {
        commandService.createUser.mockResolvedValue(mockActiveUserResponse);

        const result = await service.createUser(mockInput);

        expect(commandService.createUser).toHaveBeenCalledWith(mockInput);
        expect(commandService.createUser).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockActiveUserResponse);
      });
    });

    describe('createManyAndReturnUsers', () => {
      const mockInput: CreateManyUsersInputDto = {
        users: [
          { name: 'User1', email: 'user1@example.com' },
          { name: 'User2', email: 'user2@example.com' },
        ],
      };

      it('should delegate to UserCommandService.createManyAndReturnUsers', async () => {
        commandService.createManyAndReturnUsers.mockResolvedValue(mockActiveUsersResponse);

        const result = await service.createManyAndReturnUsers(mockInput);

        expect(commandService.createManyAndReturnUsers).toHaveBeenCalledWith(mockInput);
        expect(commandService.createManyAndReturnUsers).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockActiveUsersResponse);
      });
    });

    describe('updateUserById', () => {
      const mockInput: UpdateUserInputDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        data: { name: 'Updated Name' },
      };

      it('should delegate to UserCommandService.updateUserById', async () => {
        commandService.updateUserById.mockResolvedValue(mockActiveUserResponse);

        const result = await service.updateUserById(mockInput);

        expect(commandService.updateUserById).toHaveBeenCalledWith(mockInput);
        expect(commandService.updateUserById).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockActiveUserResponse);
      });
    });

    describe('deleteUserById', () => {
      const mockInput: DeleteUserByIdInputDto = { id: '123e4567-e89b-12d3-a456-426614174000' };

      it('should delegate to UserCommandService.deleteUserById', async () => {
        commandService.deleteUserById.mockResolvedValue(undefined);

        await service.deleteUserById(mockInput);

        expect(commandService.deleteUserById).toHaveBeenCalledWith(mockInput);
        expect(commandService.deleteUserById).toHaveBeenCalledTimes(1);
      });

      it('should return void', async () => {
        commandService.deleteUserById.mockResolvedValue(undefined);

        await service.deleteUserById(mockInput);

        expect(true).toBe(true);
      });
    });

    describe('deleteManyUsersById', () => {
      const mockInput: DeleteManyUsersInputDto = { ids: ['id1', 'id2', 'id3'] };

      it('should delegate to UserCommandService.deleteManyUsersById', async () => {
        commandService.deleteManyUsersById.mockResolvedValue(undefined);

        await service.deleteManyUsersById(mockInput);

        expect(commandService.deleteManyUsersById).toHaveBeenCalledWith(mockInput);
        expect(commandService.deleteManyUsersById).toHaveBeenCalledTimes(1);
      });

      it('should destructure and pass ids correctly', async () => {
        commandService.deleteManyUsersById.mockResolvedValue(undefined);

        await service.deleteManyUsersById({ ids: ['id1', 'id2'] });

        expect(commandService.deleteManyUsersById).toHaveBeenCalledWith({ ids: ['id1', 'id2'] });
      });
    });

    describe('hardDeleteUserById', () => {
      const mockInput: HardDeleteUserByIdInputDto = { id: '123e4567-e89b-12d3-a456-426614174000' };

      it('should delegate to UserCommandService.hardDeleteUserById', async () => {
        commandService.hardDeleteUserById.mockResolvedValue(undefined);

        await service.hardDeleteUserById(mockInput);

        expect(commandService.hardDeleteUserById).toHaveBeenCalledWith(mockInput);
        expect(commandService.hardDeleteUserById).toHaveBeenCalledTimes(1);
      });

      it('should destructure and pass id correctly', async () => {
        commandService.hardDeleteUserById.mockResolvedValue(undefined);

        await service.hardDeleteUserById({ id: 'test-id' });

        expect(commandService.hardDeleteUserById).toHaveBeenCalledWith({ id: 'test-id' });
      });
    });

    describe('hardDeleteManyUsersById', () => {
      const mockInput: HardDeleteManyUsersInputDto = { ids: ['id1', 'id2'] };

      it('should delegate to UserCommandService.hardDeleteManyUsersById', async () => {
        commandService.hardDeleteManyUsersById.mockResolvedValue(undefined);

        await service.hardDeleteManyUsersById(mockInput);

        expect(commandService.hardDeleteManyUsersById).toHaveBeenCalledWith(mockInput);
        expect(commandService.hardDeleteManyUsersById).toHaveBeenCalledTimes(1);
      });
    });

    describe('restoreUserById', () => {
      const mockInput: RestoreUserByIdInputDto = { id: '123e4567-e89b-12d3-a456-426614174000' };

      it('should delegate to UserCommandService.restoreUserById', async () => {
        commandService.restoreUserById.mockResolvedValue(mockActiveUserResponse);

        const result = await service.restoreUserById(mockInput);

        expect(commandService.restoreUserById).toHaveBeenCalledWith(mockInput);
        expect(commandService.restoreUserById).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockActiveUserResponse);
      });

      it('should destructure and pass id correctly', async () => {
        commandService.restoreUserById.mockResolvedValue(mockActiveUserResponse);

        await service.restoreUserById({ id: 'restore-id' });

        expect(commandService.restoreUserById).toHaveBeenCalledWith({ id: 'restore-id' });
      });
    });

    describe('restoreManyUsersById', () => {
      const mockInput: RestoreManyUsersInputDto = { ids: ['id1', 'id2'] };

      it('should delegate to UserCommandService.restoreManyUsersById', async () => {
        commandService.restoreManyUsersById.mockResolvedValue(mockActiveUsersResponse);

        const result = await service.restoreManyUsersById(mockInput);

        expect(commandService.restoreManyUsersById).toHaveBeenCalledWith(mockInput);
        expect(commandService.restoreManyUsersById).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockActiveUsersResponse);
      });
    });
  });

  describe('Facade Pattern Characteristics', () => {
    it('should expose all admin operations through a single interface', () => {
      expect(service.findUserById).toBeInstanceOf(Function);
      expect(service.findDeletedUserById).toBeInstanceOf(Function);
      expect(service.findAnyUserById).toBeInstanceOf(Function);
      expect(service.findManyUsers).toBeInstanceOf(Function);
      expect(service.findManyDeletedUsers).toBeInstanceOf(Function);
      expect(service.findManyAnyUsers).toBeInstanceOf(Function);

      expect(service.createUser).toBeInstanceOf(Function);
      expect(service.createManyAndReturnUsers).toBeInstanceOf(Function);
      expect(service.updateUserById).toBeInstanceOf(Function);
      expect(service.deleteUserById).toBeInstanceOf(Function);
      expect(service.deleteManyUsersById).toBeInstanceOf(Function);
      expect(service.hardDeleteUserById).toBeInstanceOf(Function);
      expect(service.hardDeleteManyUsersById).toBeInstanceOf(Function);
      expect(service.restoreUserById).toBeInstanceOf(Function);
      expect(service.restoreManyUsersById).toBeInstanceOf(Function);
    });

    it('should provide additional admin-only operations not available in app facade', () => {
      expect(service.findDeletedUserById).toBeDefined();
      expect(service.findAnyUserById).toBeDefined();
      expect(service.findManyDeletedUsers).toBeDefined();
      expect(service.findManyAnyUsers).toBeDefined();
      expect(service.hardDeleteUserById).toBeDefined();
      expect(service.hardDeleteManyUsersById).toBeDefined();
      expect(service.restoreUserById).toBeDefined();
      expect(service.restoreManyUsersById).toBeDefined();
    });

    it('should not add business logic, only delegate', async () => {
      queryService.findUserByIdOrFail.mockResolvedValue(mockActiveUserResponse);
      commandService.createUser.mockResolvedValue(mockActiveUserResponse);

      const start1 = Date.now();
      await service.findUserById({ id: 'test' });
      const duration1 = Date.now() - start1;

      const start2 = Date.now();
      await service.createUser({ name: 'Test', email: 'test@example.com' });
      const duration2 = Date.now() - start2;

      expect(duration1).toBeLessThan(10);
      expect(duration2).toBeLessThan(10);
    });
  });

  describe('Error Handling', () => {
    it('should propagate query service errors without modification', async () => {
      const error = new Error('Query failed');
      error.stack = 'Original stack';
      queryService.findUserByIdOrFail.mockRejectedValue(error);

      try {
        await service.findUserById({ id: 'test' });
        fail('Expected error to be thrown');
      } catch (e: any) {
        expect(e).toBe(error);
        expect(e.stack).toBe('Original stack');
      }
    });

    it('should propagate command service errors without modification', async () => {
      const error = new Error('Command failed');
      error.stack = 'Original stack';
      commandService.createUser.mockRejectedValue(error);

      try {
        await service.createUser({ name: 'Test', email: 'test@example.com' });
        fail('Expected error to be thrown');
      } catch (e: any) {
        expect(e).toBe(error);
        expect(e.stack).toBe('Original stack');
      }
    });

    it('should handle null/undefined errors', async () => {
      queryService.findUserByIdOrFail.mockRejectedValue(null);

      await expect(service.findUserById({ id: 'test' })).rejects.toBeNull();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent queries', async () => {
      queryService.findUserByIdOrFail.mockResolvedValue(mockActiveUserResponse);
      queryService.findDeletedUserByIdOrFail.mockResolvedValue(mockDeletedUserResponse);
      queryService.findAnyUserByIdOrFail.mockResolvedValue(mockAnyUserResponse);

      const [active, deleted, any] = await Promise.all([
        service.findUserById({ id: 'id1' }),
        service.findDeletedUserById({ id: 'id2' }),
        service.findAnyUserById({ id: 'id3' }),
      ]);

      expect(active).toBe(mockActiveUserResponse);
      expect(deleted).toBe(mockDeletedUserResponse);
      expect(any).toBe(mockAnyUserResponse);
    });

    it('should handle mixed queries and commands concurrently', async () => {
      queryService.findUserByIdOrFail.mockResolvedValue(mockActiveUserResponse);
      commandService.createUser.mockResolvedValue(mockActiveUserResponse);
      commandService.updateUserById.mockResolvedValue(mockActiveUserResponse);
      commandService.deleteUserById.mockResolvedValue(undefined);

      const results = await Promise.all([
        service.findUserById({ id: 'id1' }),
        service.createUser({ name: 'New', email: 'new@example.com' }),
        service.updateUserById({ id: 'id2', data: { name: 'Updated' } }),
        service.deleteUserById({ id: 'id3' }),
      ]);

      expect(results[0]).toBe(mockActiveUserResponse);
      expect(results[1]).toBe(mockActiveUserResponse);
      expect(results[2]).toBe(mockActiveUserResponse);
      expect(results[3]).toBeUndefined();
    });
  });

  describe('Integration with DTOs', () => {
    it('should pass DTOs through without modification', async () => {
      const complexInput: UpdateUserInputDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          name: 'Complex Update',
          email: 'complex@example.com',
        },
      };

      commandService.updateUserById.mockResolvedValue(mockActiveUserResponse);

      await service.updateUserById(complexInput);

      const [[calledWith]] = commandService.updateUserById.mock.calls;
      expect(calledWith).toBe(complexInput);
    });

    it('should return response DTOs without modification', async () => {
      const responseDto: ActiveUserResponseDto = {
        id: '123',
        name: 'Test',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryService.findUserByIdOrFail.mockResolvedValue(responseDto);

      const result = await service.findUserById({ id: '123' });

      expect(result).toBe(responseDto);
    });
  });

  describe('Performance', () => {
    it('should handle high-volume operations efficiently', async () => {
      commandService.createUser.mockResolvedValue(mockActiveUserResponse);

      const iterations = 1000;
      const start = Date.now();

      const promises = Array.from({ length: iterations }, (_, i) =>
        service.createUser({ name: `User${i}`, email: `user${i}@example.com` }),
      );

      await Promise.all(promises);

      const duration = Date.now() - start;
      const avgTimePerCall = duration / iterations;

      expect(avgTimePerCall).toBeLessThan(1);
      expect(commandService.createUser).toHaveBeenCalledTimes(iterations);
    });
  });
});
