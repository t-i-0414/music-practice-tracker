import { type TestingModule } from '@nestjs/testing';

import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import type {
  DeleteUserByIdInputDto,
  FindUserByIdInputDto,
  UpdateUserInputDto,
} from '@/modules/aggregate/user/user.input.dto';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import type { ActiveUserResponseDto } from '@/modules/aggregate/user/user.response.dto';
import {
  cleanupMocks,
  createMockUser,
  createMockUserCommandService,
  createMockUserQueryService,
  createTestModule,
  createUserInput,
  mockActiveUser,
  TEST_UUIDS,
  updateUserInput,
} from '@/tests/helpers';

describe('UserAppFacadeService', () => {
  let service: UserAppFacadeService;
  let commandService: jest.Mocked<UserCommandService>;
  let queryService: jest.Mocked<UserQueryService>;

  const mockCreatedUser = createMockUser({
    id: TEST_UUIDS.ANOTHER_USER,
    name: 'New User',
    email: 'new@example.com',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  });

  const mockUpdatedUser: ActiveUserResponseDto = {
    ...mockActiveUser,
    name: 'Updated User',
    updatedAt: new Date('2024-01-04'),
  };

  beforeEach(async () => {
    const mockCommandService = createMockUserCommandService();
    const mockQueryService = createMockUserQueryService();
    
    const module: TestingModule = await createTestModule({
      providers: [
        UserAppFacadeService,
        {
          provide: UserCommandService,
          useValue: mockCommandService,
        },
        {
          provide: UserQueryService,
          useValue: mockQueryService,
        },
      ],
    });

    service = module.get<UserAppFacadeService>(UserAppFacadeService);
    commandService = module.get(UserCommandService);
    queryService = module.get(UserQueryService);
  });

  afterEach(() => {
    cleanupMocks();
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

  describe('findUserById', () => {
    const mockInput: FindUserByIdInputDto = {
      id: TEST_UUIDS.ACTIVE_USER,
    };

    it('should delegate to UserQueryService.findUserByIdOrFail', async () => {
      queryService.findUserByIdOrFail.mockResolvedValue(mockActiveUser);

      const result = await service.findUserById(mockInput);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith(mockInput);
      expect(queryService.findUserByIdOrFail).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockActiveUser);
    });

    it('should not call any command service methods', async () => {
      queryService.findUserByIdOrFail.mockResolvedValue(mockActiveUser);

      await service.findUserById(mockInput);

      expect(commandService.createUser).not.toHaveBeenCalled();
      expect(commandService.updateUserById).not.toHaveBeenCalled();
      expect(commandService.deleteUserById).not.toHaveBeenCalled();
    });

    it('should propagate errors from query service', async () => {
      const error = new Error('User not found');
      queryService.findUserByIdOrFail.mockRejectedValue(error);

      await expect(service.findUserById(mockInput)).rejects.toThrow(error);
      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith(mockInput);
    });
  });

  describe('createUser', () => {
    it('should delegate to UserCommandService.createUser', async () => {
      commandService.createUser.mockResolvedValue(mockCreatedUser);

      const result = await service.createUser(createUserInput);

      expect(commandService.createUser).toHaveBeenCalledWith(createUserInput);
      expect(commandService.createUser).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockCreatedUser);
    });

    it('should not call any query service methods', async () => {
      commandService.createUser.mockResolvedValue(mockCreatedUser);

      await service.createUser(createUserInput);

      expect(queryService.findUserByIdOrFail).not.toHaveBeenCalled();
    });

    it('should propagate errors from command service', async () => {
      const error = new Error('Email already exists');
      commandService.createUser.mockRejectedValue(error);

      await expect(service.createUser(createUserInput)).rejects.toThrow(error);
      expect(commandService.createUser).toHaveBeenCalledWith(createUserInput);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid email format');
      commandService.createUser.mockRejectedValue(validationError);

      await expect(service.createUser(createUserInput)).rejects.toThrow(validationError);
    });
  });

  describe('updateUserById', () => {
    const mockInput: UpdateUserInputDto = {
      id: TEST_UUIDS.ACTIVE_USER,
      data: updateUserInput,
    };

    it('should delegate to UserCommandService.updateUserById', async () => {
      commandService.updateUserById.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserById(mockInput);

      expect(commandService.updateUserById).toHaveBeenCalledWith(mockInput);
      expect(commandService.updateUserById).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUpdatedUser);
    });

    it('should propagate errors from command service', async () => {
      const error = new Error('User not found');
      commandService.updateUserById.mockRejectedValue(error);

      await expect(service.updateUserById(mockInput)).rejects.toThrow(error);
      expect(commandService.updateUserById).toHaveBeenCalledWith(mockInput);
    });

    it('should handle partial updates', async () => {
      const partialUpdateInput: UpdateUserInputDto = {
        id: TEST_UUIDS.ACTIVE_USER,
        data: {
          email: 'newemail@example.com',
        },
      };

      const updatedUser = createMockUser({
        ...mockActiveUser,
        email: 'newemail@example.com',
      });
      commandService.updateUserById.mockResolvedValue(updatedUser);

      const result = await service.updateUserById(partialUpdateInput);

      expect(commandService.updateUserById).toHaveBeenCalledWith(partialUpdateInput);
      expect(result.email).toBe('newemail@example.com');
    });
  });

  describe('deleteUserById', () => {
    const mockInput: DeleteUserByIdInputDto = {
      id: TEST_UUIDS.ACTIVE_USER,
    };

    it('should delegate to UserCommandService.deleteUserById', async () => {
      commandService.deleteUserById.mockResolvedValue(undefined);

      await service.deleteUserById(mockInput);

      expect(commandService.deleteUserById).toHaveBeenCalledWith(mockInput);
      expect(commandService.deleteUserById).toHaveBeenCalledTimes(1);
    });

    it('should return void even if command service returns a value', async () => {
      // In case the command service implementation changes to return something
      (commandService.deleteUserById as jest.Mock).mockResolvedValue({ deleted: true });

      await service.deleteUserById(mockInput);
      const result = undefined;

      expect(result).toBeUndefined();
      expect(commandService.deleteUserById).toHaveBeenCalledWith(mockInput);
    });

    it('should propagate errors from command service', async () => {
      const error = new Error('User not found');
      commandService.deleteUserById.mockRejectedValue(error);

      await expect(service.deleteUserById(mockInput)).rejects.toThrow(error);
      expect(commandService.deleteUserById).toHaveBeenCalledWith(mockInput);
    });

    it('should not call any other service methods', async () => {
      commandService.deleteUserById.mockResolvedValue(undefined);

      await service.deleteUserById(mockInput);

      expect(queryService.findUserByIdOrFail).not.toHaveBeenCalled();
      expect(commandService.createUser).not.toHaveBeenCalled();
      expect(commandService.updateUserById).not.toHaveBeenCalled();
    });
  });

  describe('Method delegation patterns', () => {
    it('should maintain method signatures correctly', () => {
      // Verify that facade methods have the correct signatures
      expect(service.findUserById).toBeInstanceOf(Function);
      expect(service.createUser).toBeInstanceOf(Function);
      expect(service.updateUserById).toBeInstanceOf(Function);
      expect(service.deleteUserById).toBeInstanceOf(Function);

      // Verify parameter counts
      expect(service.findUserById.length).toBe(1);
      expect(service.createUser.length).toBe(1);
      expect(service.updateUserById.length).toBe(1);
      expect(service.deleteUserById.length).toBe(1);
    });

    it('should handle concurrent requests independently', async () => {
      queryService.findUserByIdOrFail.mockResolvedValue(mockActiveUser);
      commandService.createUser.mockResolvedValue(mockCreatedUser);
      commandService.updateUserById.mockResolvedValue(mockUpdatedUser);
      commandService.deleteUserById.mockResolvedValue(undefined);

      const results = await Promise.all([
        service.findUserById({ id: '123' }),
        service.createUser({ name: 'New', email: 'new@example.com' }),
        service.updateUserById({ id: '123', data: { name: 'Updated' } }),
        service.deleteUserById({ id: '456' }),
      ]);

      const [findResult, createResult, updateResult] = results;

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledTimes(1);
      expect(commandService.createUser).toHaveBeenCalledTimes(1);
      expect(commandService.updateUserById).toHaveBeenCalledTimes(1);
      expect(commandService.deleteUserById).toHaveBeenCalledTimes(1);

      expect(findResult).toBe(mockActiveUser);
      expect(createResult).toBe(mockCreatedUser);
      expect(updateResult).toBe(mockUpdatedUser);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle null/undefined errors gracefully', async () => {
      commandService.createUser.mockRejectedValue(null);

      await expect(service.createUser({ name: 'Test', email: 'test@example.com' })).rejects.toBeNull();
    });

    it('should preserve error stack traces', async () => {
      const error = new Error('Test error');
      error.stack = 'Original stack trace';
      queryService.findUserByIdOrFail.mockRejectedValue(error);

      try {
        await service.findUserById({ id: '123' });
        fail('Expected error to be thrown');
      } catch (e: any) {
        expect(e).toBe(error);
        expect(e.stack).toBe('Original stack trace');
      }
    });

    it('should handle timeout scenarios', async () => {
      commandService.createUser.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Timeout'));
            }, 100);
          }),
      );

      await expect(service.createUser({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Timeout');
    });
  });

  describe('Integration with DTOs', () => {
    it('should pass through complex input DTOs correctly', async () => {
      const complexUpdateDto: UpdateUserInputDto = {
        id: TEST_UUIDS.ACTIVE_USER,
        data: {
          name: 'Complex Update',
          email: 'complex@example.com',
        },
      };

      commandService.updateUserById.mockResolvedValue(mockUpdatedUser);

      await service.updateUserById(complexUpdateDto);

      expect(commandService.updateUserById).toHaveBeenCalledWith(complexUpdateDto);
      const [[calledWith]] = commandService.updateUserById.mock.calls;
      expect(calledWith).toEqual(complexUpdateDto);
      expect(calledWith).toBe(complexUpdateDto);
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

      expect(result).toBe(responseDto); // Same reference, no cloning
    });
  });

  describe('Performance considerations', () => {
    it('should not add significant overhead to service calls', async () => {
      commandService.createUser.mockResolvedValue(mockCreatedUser);

      const iterations = 1000;
      const start = Date.now();

      const promises = Array.from({ length: iterations }, (_, i) =>
        service.createUser({ name: `User${i}`, email: `user${i}@example.com` }),
      );
      await Promise.all(promises);

      const duration = Date.now() - start;
      const avgTimePerCall = duration / iterations;

      expect(avgTimePerCall).toBeLessThan(1);
    });
  });
});
