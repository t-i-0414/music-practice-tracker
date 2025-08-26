import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/aggregates/user/command.service';
import { toUserResponseDto, toUsersResponseDto } from '@/aggregates/user/dto';
import { UserQueryService } from '@/aggregates/user/query.service';
import { AdminUsersController } from '@/apis/admin/users/controller';
import { UserResponseDtoFactory } from '@/tests/factory';

describe('adminUsersController', () => {
  let controller: AdminUsersController;
  let queryService: jest.Mocked<UserQueryService>;
  let commandService: jest.Mocked<UserCommandService>;
  let userResponseDtoFactory: UserResponseDtoFactory;

  beforeEach(async () => {
    userResponseDtoFactory = new UserResponseDtoFactory();

    const mockQueryService = {
      findUserByIdOrFail: jest.fn(),
      findManyUsers: jest.fn(),
    };

    const mockCommandService = {
      createUser: jest.fn(),
      createManyAndReturnUsers: jest.fn(),
      updateUserById: jest.fn(),
      deleteUserById: jest.fn(),
      deleteManyUsersById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
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

    controller = module.get<AdminUsersController>(AdminUsersController);
    queryService = module.get(UserQueryService);
    commandService = module.get(UserCommandService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findManyUsers', () => {
    it('should find many users with array of publicIds', async () => {
      expect.assertions(2);

      const mockUser = userResponseDtoFactory.build();
      const publicIds = ['id1', 'id2'];
      const expectedResult = toUsersResponseDto([mockUser]);
      queryService.findManyUsers.mockResolvedValue(expectedResult);

      const result = await controller.findManyUsers(publicIds);

      expect(queryService.findManyUsers).toHaveBeenCalledWith({ publicIds });
      expect(result).toStrictEqual(expectedResult);
    });

    it('should find many users with single publicId string', async () => {
      expect.assertions(2);

      const mockUser = userResponseDtoFactory.build();
      const publicId = 'id1';
      const expectedResult = toUsersResponseDto([mockUser]);
      queryService.findManyUsers.mockResolvedValue(expectedResult);

      const result = await controller.findManyUsers(publicId);

      expect(queryService.findManyUsers).toHaveBeenCalledWith({ publicIds: [publicId] });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findUserById', () => {
    it('should find user by publicId', async () => {
      expect.assertions(2);

      const mockUser = userResponseDtoFactory.build();
      const { publicId } = mockUser;
      const expectedResult = toUserResponseDto(mockUser);
      queryService.findUserByIdOrFail.mockResolvedValue(expectedResult);

      const result = await controller.findUserById(publicId);

      expect(queryService.findUserByIdOrFail).toHaveBeenCalledWith({ publicId });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createUser', () => {
    it('should create user', async () => {
      expect.assertions(2);

      const mockUser = userResponseDtoFactory.build();
      const createDto = { email: mockUser.email, name: mockUser.name };
      const expectedResult = toUserResponseDto(mockUser);
      commandService.createUser.mockResolvedValue(expectedResult);

      const result = await controller.createUser(createDto);

      expect(commandService.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createManyUsers', () => {
    it('should create many users', async () => {
      expect.assertions(2);

      const mockUser = userResponseDtoFactory.build();
      const createDto = { users: [{ email: 'user1@example.com', name: 'User 1' }] };
      const expectedResult = toUsersResponseDto([mockUser]);
      commandService.createManyAndReturnUsers.mockResolvedValue(expectedResult);

      const result = await controller.createManyUsers(createDto);

      expect(commandService.createManyAndReturnUsers).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      expect.assertions(2);

      const mockUser = userResponseDtoFactory.build();
      const { publicId } = mockUser;
      const data = { name: 'Updated Name' };
      const expectedResult = toUserResponseDto({ ...mockUser, name: 'Updated Name' });
      commandService.updateUserById.mockResolvedValue(expectedResult);

      const result = await controller.updateUser(publicId, data);

      expect(commandService.updateUserById).toHaveBeenCalledWith({ publicId, data });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('deleteManyUsers', () => {
    it('should delete many users', async () => {
      expect.assertions(1);

      const dto = { publicIds: ['id1', 'id2'] };
      commandService.deleteManyUsersById.mockResolvedValue();

      await controller.deleteManyUsers(dto);

      expect(commandService.deleteManyUsersById).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      expect.assertions(1);

      const mockUser = userResponseDtoFactory.build();
      const { publicId } = mockUser;
      commandService.deleteUserById.mockResolvedValue();

      await controller.deleteUser(publicId);

      expect(commandService.deleteUserById).toHaveBeenCalledWith({ publicId });
    });
  });
});
