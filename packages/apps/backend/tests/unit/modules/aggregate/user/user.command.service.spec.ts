import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/modules/aggregate/user/user.command.service';
import { UserQueryService } from '@/modules/aggregate/user/user.query.service';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import { toUserResponseDto, toUsersResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { buildUserResponseDto } from '@/tests/factory/user.factory';

describe('userCommandService', () => {
  let service: UserCommandService;
  let repository: jest.Mocked<UserRepositoryService>;
  let queryService: jest.Mocked<UserQueryService>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<UserRepositoryService> = {
      createUser: jest.fn(),
      createManyAndReturnUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      deleteManyUsers: jest.fn(),
    } as any;

    const mockQueryService: jest.Mocked<UserQueryService> = {
      findUserByIdOrFail: jest.fn(),
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

      const mockUser = buildUserResponseDto();
      const createDto = { email: mockUser.email, name: mockUser.name };
      repository.createUser.mockResolvedValue({ ...mockUser, id: 1 });

      const result = await service.createUser(createDto);

      expect(repository.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(toUserResponseDto(mockUser));
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should create many users and return them', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const mockUser2 = buildUserResponseDto();
      const mockUsers = [mockUser, mockUser2];
      repository.createManyAndReturnUsers.mockResolvedValue([
        { ...mockUser, id: 1 },
        { ...mockUser2, id: 2 },
      ]);

      const result = await service.createManyAndReturnUsers({ users: [mockUser, mockUser2] });

      expect(repository.createManyAndReturnUsers).toHaveBeenCalledWith([mockUser, mockUser2]);
      expect(result).toStrictEqual(toUsersResponseDto(mockUsers));
    });
  });

  describe('updateUserById', () => {
    it('should update user when user exists', async () => {
      expect.assertions(3);

      const mockUser = buildUserResponseDto();
      const updateDto = { publicId: mockUser.publicId, data: { name: 'Updated Name' } };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      queryService.findUserByIdOrFail.mockResolvedValue(toUserResponseDto(mockUser));
      repository.updateUser.mockResolvedValue({ ...updatedUser, id: 1 });

      const result = await service.updateUserById(updateDto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ publicId: mockUser.publicId });
      expect(repository.updateUser).toHaveBeenCalledWith({
        where: { publicId: mockUser.publicId },
        data: { name: 'Updated Name' },
      });
      expect(result).toStrictEqual(toUserResponseDto(updatedUser));
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const updateDto = { publicId: mockUser.publicId, data: { name: 'Updated Name' } };
      queryService.findUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.updateUserById(updateDto)).rejects.toThrow('User not found');
      expect(repository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUserById', () => {
    it('should delete user when user exists', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const deleteDto = { publicId: mockUser.publicId };
      queryService.findUserByIdOrFail.mockResolvedValue(toUserResponseDto(mockUser));
      repository.deleteUser.mockResolvedValue();

      await service.deleteUserById(deleteDto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ publicId: mockUser.publicId });
      expect(repository.deleteUser).toHaveBeenCalledWith({ publicId: mockUser.publicId });
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
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
});
