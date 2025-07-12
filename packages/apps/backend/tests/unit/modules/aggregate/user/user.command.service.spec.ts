import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import { toActiveUserDto, toActiveUsersDto, toAnyUserDto } from '@/modules/aggregate/user/user.response.dto';

describe('userCommandService', () => {
  let service: UserCommandService;
  let repository: jest.Mocked<UserRepositoryService>;
  let queryService: jest.Mocked<UserQueryService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
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
      createUser: jest.fn(),
      createManyAndReturnUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      deleteManyUsers: jest.fn(),
      hardDeleteUser: jest.fn(),
      hardDeleteManyUsers: jest.fn(),
      restoreUser: jest.fn(),
      restoreManyAndReturnUsers: jest.fn(),
    } as any;

    const mockQueryService: jest.Mocked<UserQueryService> = {
      findUserByIdOrFail: jest.fn(),
      findAnyUserByIdOrFail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCommandService,
        {
          provide: UserRepositoryService,
          useValue: mockRepository,
        },
        {
          provide: UserQueryService,
          useValue: mockQueryService,
        },
      ],
    }).compile();

    service = module.get<UserCommandService>(UserCommandService);
    repository = module.get(UserRepositoryService);
    queryService = module.get(UserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create and return user', async () => {
      expect.assertions(2);

      const createDto = { email: mockUser.email, name: mockUser.name };
      repository.createUser.mockResolvedValue(mockUser);

      const result = await service.createUser(createDto);

      expect(repository.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(toActiveUserDto(mockUser));
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should create many users and return them', async () => {
      expect.assertions(2);

      const users = [{ email: 'user1@example.com', name: 'User 1' }, { email: 'user2@example.com', name: 'User 2' }];
      const mockUsers = [mockUser, { ...mockUser, id: '223e4567-e89b-12d3-a456-426614174001', email: 'user2@example.com', name: 'User 2' }];
      repository.createManyAndReturnUsers.mockResolvedValue(mockUsers);

      const result = await service.createManyAndReturnUsers({ users });

      expect(repository.createManyAndReturnUsers).toHaveBeenCalledWith(users);
      expect(result).toStrictEqual(toActiveUsersDto(mockUsers));
    });
  });

  describe('updateUserById', () => {
    it('should update user when user exists', async () => {
      expect.assertions(3);

      const updateDto = { id: mockUser.id, data: { name: 'Updated Name' } };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      queryService.findUserByIdOrFail.mockResolvedValue(toActiveUserDto(mockUser));
      repository.updateUser.mockResolvedValue(updatedUser);

      const result = await service.updateUserById(updateDto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ id: mockUser.id });
      expect(repository.updateUser).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { name: 'Updated Name' },
      });
      expect(result).toStrictEqual(toActiveUserDto(updatedUser));
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const updateDto = { id: mockUser.id, data: { name: 'Updated Name' } };
      queryService.findUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.updateUserById(updateDto)).rejects.toThrow('User not found');
      expect(repository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUserById', () => {
    it('should delete user when user exists', async () => {
      expect.assertions(2);

      const deleteDto = { id: mockUser.id };
      queryService.findUserByIdOrFail.mockResolvedValue(toActiveUserDto(mockUser));
      repository.deleteUser.mockResolvedValue();

      await service.deleteUserById(deleteDto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ id: mockUser.id });
      expect(repository.deleteUser).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const deleteDto = { id: mockUser.id };
      queryService.findUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.deleteUserById(deleteDto)).rejects.toThrow('User not found');
      expect(repository.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyUsersById', () => {
    it('should delete many users', async () => {
      expect.assertions(1);

      const ids = ['id1', 'id2'];
      repository.deleteManyUsers.mockResolvedValue();

      await service.deleteManyUsersById({ ids });

      expect(repository.deleteManyUsers).toHaveBeenCalledWith({
        id: { in: ids },
      });
    });
  });

  describe('hardDeleteUserById', () => {
    it('should hard delete user when user exists', async () => {
      expect.assertions(2);

      const deleteDto = { id: mockUser.id };
      queryService.findAnyUserByIdOrFail.mockResolvedValue(toAnyUserDto(mockUser));
      repository.hardDeleteUser.mockResolvedValue();

      await service.hardDeleteUserById(deleteDto);

      expect(queryService.findAnyUserByIdOrFail).toHaveBeenCalledWith({ id: mockUser.id });
      expect(repository.hardDeleteUser).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const deleteDto = { id: mockUser.id };
      queryService.findAnyUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.hardDeleteUserById(deleteDto)).rejects.toThrow('User not found');
      expect(repository.hardDeleteUser).not.toHaveBeenCalled();
    });
  });

  describe('hardDeleteManyUsersById', () => {
    it('should hard delete many users', async () => {
      expect.assertions(1);

      const ids = ['id1', 'id2'];
      repository.hardDeleteManyUsers.mockResolvedValue();

      await service.hardDeleteManyUsersById({ ids });

      expect(repository.hardDeleteManyUsers).toHaveBeenCalledWith({
        id: { in: ids },
      });
    });
  });

  describe('restoreUserById', () => {
    it('should restore user and return it', async () => {
      expect.assertions(2);

      const restoreDto = { id: mockDeletedUser.id };
      const restoredUser = { ...mockDeletedUser, deletedAt: null };
      repository.restoreUser.mockResolvedValue(restoredUser);

      const result = await service.restoreUserById(restoreDto);

      expect(repository.restoreUser).toHaveBeenCalledWith({ id: mockDeletedUser.id });
      expect(result).toStrictEqual(toActiveUserDto(restoredUser));
    });
  });

  describe('restoreManyUsersById', () => {
    it('should restore many users and return them', async () => {
      expect.assertions(2);

      const ids = ['id1', 'id2'];
      const restoredUsers = [mockUser, { ...mockUser, id: 'id2' }];
      repository.restoreManyAndReturnUsers.mockResolvedValue(restoredUsers);

      const result = await service.restoreManyUsersById({ ids });

      expect(repository.restoreManyAndReturnUsers).toHaveBeenCalledWith({
        id: { in: ids },
      });
      expect(result).toStrictEqual(toActiveUsersDto(restoredUsers));
    });
  });
});