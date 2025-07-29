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
    id: 1,
    publicId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    suspendedAt: null,
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
      suspendUser: jest.fn(),
      suspendManyUsers: jest.fn(),
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

      const users = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
      ];
      const mockUsers = [
        mockUser,
        { ...mockUser, publicId: '223e4567-e89b-12d3-a456-426614174001', email: 'user2@example.com', name: 'User 2' },
      ];
      repository.createManyAndReturnUsers.mockResolvedValue(mockUsers);

      const result = await service.createManyAndReturnUsers({ users });

      expect(repository.createManyAndReturnUsers).toHaveBeenCalledWith(users);
      expect(result).toStrictEqual(toActiveUsersDto(mockUsers));
    });
  });

  describe('updateUserById', () => {
    it('should update user when user exists', async () => {
      expect.assertions(3);

      const updateDto = { publicId: mockUser.publicId, data: { name: 'Updated Name' } };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      queryService.findUserByIdOrFail.mockResolvedValue(toActiveUserDto(mockUser));
      repository.updateUser.mockResolvedValue(updatedUser);

      const result = await service.updateUserById(updateDto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ publicId: mockUser.publicId });
      expect(repository.updateUser).toHaveBeenCalledWith({
        where: { publicId: mockUser.publicId },
        data: { name: 'Updated Name' },
      });
      expect(result).toStrictEqual(toActiveUserDto(updatedUser));
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const updateDto = { publicId: mockUser.publicId, data: { name: 'Updated Name' } };
      queryService.findUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.updateUserById(updateDto)).rejects.toThrow('User not found');
      expect(repository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUserById', () => {
    it('should delete user when user exists', async () => {
      expect.assertions(2);

      const deleteDto = { publicId: mockUser.publicId };
      queryService.findUserByIdOrFail.mockResolvedValue(toActiveUserDto(mockUser));
      repository.deleteUser.mockResolvedValue();

      await service.deleteUserById(deleteDto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ publicId: mockUser.publicId });
      expect(repository.deleteUser).toHaveBeenCalledWith({ publicId: mockUser.publicId });
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const deleteDto = { publicId: mockUser.publicId };
      queryService.findUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.deleteUserById(deleteDto)).rejects.toThrow('User not found');
      expect(repository.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyUsersById', () => {
    it('should delete many users', async () => {
      expect.assertions(1);

      const publicIds = ['id1', 'id2'];
      repository.deleteManyUsers.mockResolvedValue();

      await service.deleteManyUsersById({ publicIds });

      expect(repository.deleteManyUsers).toHaveBeenCalledWith({
        publicId: { in: publicIds },
      });
    });
  });

  describe('hardDeleteUserById', () => {
    it('should hard delete user when user exists', async () => {
      expect.assertions(2);

      const deleteDto = { publicId: mockUser.publicId };
      queryService.findAnyUserByIdOrFail.mockResolvedValue(toAnyUserDto(mockUser));
      repository.hardDeleteUser.mockResolvedValue();

      await service.hardDeleteUserById(deleteDto);

      expect(queryService.findAnyUserByIdOrFail).toHaveBeenCalledWith({ publicId: mockUser.publicId });
      expect(repository.hardDeleteUser).toHaveBeenCalledWith({ publicId: mockUser.publicId });
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const deleteDto = { publicId: mockUser.publicId };
      queryService.findAnyUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.hardDeleteUserById(deleteDto)).rejects.toThrow('User not found');
      expect(repository.hardDeleteUser).not.toHaveBeenCalled();
    });
  });

  describe('hardDeleteManyUsersById', () => {
    it('should hard delete many users', async () => {
      expect.assertions(1);

      const publicIds = ['id1', 'id2'];
      repository.hardDeleteManyUsers.mockResolvedValue();

      await service.hardDeleteManyUsersById({ publicIds });

      expect(repository.hardDeleteManyUsers).toHaveBeenCalledWith({
        publicId: { in: publicIds },
      });
    });
  });

  describe('restoreUserById', () => {
    it('should restore user and return it', async () => {
      expect.assertions(2);

      const restoreDto = { publicId: mockDeletedUser.publicId };
      const restoredUser = { ...mockDeletedUser, deletedAt: null };
      repository.restoreUser.mockResolvedValue(restoredUser);

      const result = await service.restoreUserById(restoreDto);

      expect(repository.restoreUser).toHaveBeenCalledWith({ publicId: mockDeletedUser.publicId });
      expect(result).toStrictEqual(toActiveUserDto(restoredUser));
    });
  });

  describe('restoreManyUsersById', () => {
    it('should restore many users and return them', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2'];
      const restoredUsers = [mockUser, { ...mockUser, publicId: 'id2' }];
      repository.restoreManyAndReturnUsers.mockResolvedValue(restoredUsers);

      const result = await service.restoreManyUsersById({ publicIds });

      expect(repository.restoreManyAndReturnUsers).toHaveBeenCalledWith({
        publicId: { in: publicIds },
      });
      expect(result).toStrictEqual(toActiveUsersDto(restoredUsers));
    });
  });

  describe('suspendUserById', () => {
    it('should suspend user successfully', async () => {
      expect.assertions(2);

      const { publicId } = mockUser;
      queryService.findUserByIdOrFail.mockResolvedValue(toActiveUserDto(mockUser));
      repository.suspendUser.mockResolvedValue({ ...mockUser, suspendedAt: new Date() });

      await service.suspendUserById({ publicId });

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ publicId });
      expect(repository.suspendUser).toHaveBeenCalledWith({ publicId });
    });

    it('should throw error if user not found', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      queryService.findUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.suspendUserById({ publicId })).rejects.toThrow('User not found');
      expect(repository.suspendUser).not.toHaveBeenCalled();
    });
  });

  describe('suspendManyUsersById', () => {
    it('should suspend many users successfully', async () => {
      expect.assertions(1);

      const publicIds = ['id1', 'id2'];
      repository.suspendManyUsers.mockResolvedValue();

      await service.suspendManyUsersById({ publicIds });

      expect(repository.suspendManyUsers).toHaveBeenCalledWith({
        publicId: { in: publicIds },
      });
    });
  });
});
