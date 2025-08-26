import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/aggregates/user/command.service';
import { toUserResponseDto, toUsersResponseDto } from '@/aggregates/user/dto';
import { UserQueryService } from '@/aggregates/user/query.service';
import { RepositoryService } from '@/repository/service';
import { UserFactory } from '@/tests/factory';

describe('userCommandService', () => {
  let service: UserCommandService;
  let repository: {
    user: {
      create: jest.Mock;
      createManyAndReturn: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let queryService: { findUserByIdOrFail: jest.Mock };
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();

    const mockRepository = {
      user: {
        create: jest.fn(),
        createManyAndReturn: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const mockQueryService = {
      findUserByIdOrFail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCommandService,
        {
          provide: RepositoryService,
          useValue: mockRepository,
        },
        {
          provide: UserQueryService,
          useValue: mockQueryService,
        },
      ],
    }).compile();

    service = module.get<UserCommandService>(UserCommandService);
    repository = module.get(RepositoryService);
    queryService = module.get(UserQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create and return user', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const createDto = { email: mockUser.email, name: mockUser.name };
      repository.user.create.mockResolvedValue({ ...mockUser, id: 1 });

      const result = await service.createUser(createDto);

      expect(repository.user.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toStrictEqual(toUserResponseDto(mockUser));
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should create many users and return them', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const mockUser2 = userFactory.build();
      const mockUsers = [mockUser, mockUser2];
      repository.user.createManyAndReturn.mockResolvedValue([
        { ...mockUser, id: 1 },
        { ...mockUser2, id: 2 },
      ]);

      const result = await service.createManyAndReturnUsers({ users: [mockUser, mockUser2] });

      expect(repository.user.createManyAndReturn).toHaveBeenCalledWith({
        data: [mockUser, mockUser2],
      });
      expect(result).toStrictEqual(toUsersResponseDto(mockUsers));
    });
  });

  describe('updateUserById', () => {
    it('should update user when user exists', async () => {
      expect.assertions(3);

      const mockUser = userFactory.build();
      const updateDto = { publicId: mockUser.publicId, data: { name: 'Updated Name' } };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      queryService.findUserByIdOrFail.mockResolvedValue(toUserResponseDto(mockUser));
      repository.user.update.mockResolvedValue({ ...updatedUser, id: 1 });

      const result = await service.updateUserById(updateDto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ publicId: mockUser.publicId });
      expect(repository.user.update).toHaveBeenCalledWith({
        where: { publicId: mockUser.publicId },
        data: { name: 'Updated Name' },
      });
      expect(result).toStrictEqual(toUserResponseDto(updatedUser));
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const updateDto = { publicId: mockUser.publicId, data: { name: 'Updated Name' } };
      queryService.findUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.updateUserById(updateDto)).rejects.toThrow('User not found');
      expect(repository.user.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUserById', () => {
    it('should delete user when user exists', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const deleteDto = { publicId: mockUser.publicId };
      queryService.findUserByIdOrFail.mockResolvedValue(toUserResponseDto(mockUser));
      repository.user.delete.mockResolvedValue(undefined);

      await service.deleteUserById(deleteDto);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ publicId: mockUser.publicId });
      expect(repository.user.delete).toHaveBeenCalledWith({
        where: { publicId: mockUser.publicId },
      });
    });

    it('should throw when user not found', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const deleteDto = { publicId: mockUser.publicId };
      queryService.findUserByIdOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.deleteUserById(deleteDto)).rejects.toThrow('User not found');
      expect(repository.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyUsersById', () => {
    it('should delete many users', async () => {
      expect.assertions(1);

      const publicIds = ['id1', 'id2'];
      repository.user.deleteMany.mockResolvedValue(undefined);

      await service.deleteManyUsersById({ publicIds });

      expect(repository.user.deleteMany).toHaveBeenCalledWith({
        where: {
          publicId: { in: publicIds },
        },
      });
    });
  });
});
