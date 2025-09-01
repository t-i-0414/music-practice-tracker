import { Test, TestingModule } from '@nestjs/testing';

import { AdminApiUsersController } from '@/apis/admin/users/users.controller';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { toUserResponseDto, toUsersResponseDto } from '@/domain/aggregates/user/utils/dto';
import { UserFactory } from '@/tests/factory';

describe('adminApiUsersController', () => {
  let controller: AdminApiUsersController;
  let queryService: jest.Mocked<UserQueryService>;
  let commandService: jest.Mocked<UserCommandService>;
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();

    const mockQueryService = {
      findUniqueOrThrowUserById: jest.fn(),
      findManyUsersById: jest.fn(),
    };

    const mockCommandService = {
      createUser: jest.fn(),
      createManyAndReturnUsers: jest.fn(),
      updateUserById: jest.fn(),
      deleteUserById: jest.fn(),
      deleteManyUsersById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminApiUsersController],
      providers: [
        {
          provide: UserQueryService,
          useValue: mockQueryService,
        },
        {
          provide: UserCommandService,
          useValue: mockCommandService,
        },
      ],
    }).compile();

    controller = module.get<AdminApiUsersController>(AdminApiUsersController);
    queryService = module.get(UserQueryService);
    commandService = module.get(UserCommandService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('gET /admin/users', () => {
    it('should return users when publicIds not provided', async () => {
      expect.assertions(2);

      const mockUsers = userFactory.buildMany(3);
      const mockResponse = toUsersResponseDto(mockUsers);
      queryService.findManyUsersById.mockResolvedValue(mockResponse);

      const result = await controller.findManyUsersById([]);

      expect(queryService.findManyUsersById).toHaveBeenCalledWith({ publicIds: [] });
      expect(result).toStrictEqual(mockResponse);
    });

    it('should return users by public IDs when provided', async () => {
      expect.assertions(2);

      const mockUsers = userFactory.buildMany(2);
      const publicIds = mockUsers.map((user) => user.publicId);
      const mockResponse = toUsersResponseDto(mockUsers);
      queryService.findManyUsersById.mockResolvedValue(mockResponse);

      const result = await controller.findManyUsersById(publicIds);

      expect(queryService.findManyUsersById).toHaveBeenCalledWith({ publicIds });
      expect(result).toStrictEqual(mockResponse);
    });

    it('should handle string input for single ID', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const { publicId } = mockUser;
      const mockResponse = toUsersResponseDto([mockUser]);
      queryService.findManyUsersById.mockResolvedValue(mockResponse);

      const result = await controller.findManyUsersById(publicId);

      expect(queryService.findManyUsersById).toHaveBeenCalledWith({ publicIds: [publicId] });
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('gET /admin/users/:publicId', () => {
    it('should return user by public ID', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const mockResponseDto = toUserResponseDto(mockUser);
      queryService.findUniqueOrThrowUserById.mockResolvedValue(mockResponseDto);

      const result = await controller.findUniqueOrThrowUserById(mockUser.publicId);

      expect(queryService.findUniqueOrThrowUserById).toHaveBeenCalledWith({
        publicId: mockUser.publicId,
      });
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('pOST /admin/users', () => {
    it('should create a new user', async () => {
      expect.assertions(2);

      const createDto = {
        email: 'user@example.com',
        name: 'New User',
      };
      const mockUser = userFactory.build(createDto);
      const mockResponseDto = toUserResponseDto(mockUser);
      commandService.createUser.mockResolvedValue(mockResponseDto);

      const result = await controller.createUser(createDto);

      expect(commandService.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('pOST /admin/users/bulk', () => {
    it('should create multiple users', async () => {
      expect.assertions(2);

      const createDto = {
        users: [
          {
            email: 'user1@example.com',
            name: 'User 1',
          },
          {
            email: 'user2@example.com',
            name: 'User 2',
          },
        ],
      };
      const mockUsers = [userFactory.build(createDto.users[0]), userFactory.build(createDto.users[1])];
      const mockResponse = toUsersResponseDto(mockUsers);
      commandService.createManyAndReturnUsers.mockResolvedValue(mockResponse);

      const result = await controller.createManyAndReturnUsers(createDto);

      expect(commandService.createManyAndReturnUsers).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('pUT /admin/users/:publicId', () => {
    it('should update a user', async () => {
      expect.assertions(2);

      const publicId = 'user-public-id';
      const updateDto = {
        name: 'Updated Name',
      };
      const mockUpdatedUser = userFactory.build({
        publicId,
        ...updateDto,
      });
      const mockResponseDto = toUserResponseDto(mockUpdatedUser);
      commandService.updateUserById.mockResolvedValue(mockResponseDto);

      const result = await controller.updateUserById(publicId, updateDto);

      expect(commandService.updateUserById).toHaveBeenCalledWith({ publicId, data: updateDto });
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('dELETE /admin/users', () => {
    it('should delete multiple users', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2', 'id3'];
      const deleteDto = { publicIds };
      commandService.deleteManyUsersById.mockResolvedValue(undefined);

      await controller.deleteManyUsersById(deleteDto);

      expect(commandService.deleteManyUsersById).toHaveBeenCalledWith(deleteDto);
      expect(commandService.deleteManyUsersById).toHaveBeenCalledTimes(1);
    });
  });

  describe('dELETE /admin/users/:publicId', () => {
    it('should delete a user', async () => {
      expect.assertions(2);

      const publicId = 'user-public-id';
      commandService.deleteUserById.mockResolvedValue(undefined);

      await controller.deleteUserById(publicId);

      expect(commandService.deleteUserById).toHaveBeenCalledWith({ publicId });
      expect(commandService.deleteUserById).toHaveBeenCalledTimes(1);
    });
  });
});
