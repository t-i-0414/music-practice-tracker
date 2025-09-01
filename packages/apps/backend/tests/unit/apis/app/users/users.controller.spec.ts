import { Test, TestingModule } from '@nestjs/testing';

import { AppApiUsersController } from '@/apis/app/users/users.controller';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { toUserResponseDto } from '@/domain/aggregates/user/utils/dto';
import { UserFactory } from '@/tests/factory';

describe('appApiUsersController', () => {
  let controller: AppApiUsersController;
  let queryService: jest.Mocked<UserQueryService>;
  let commandService: jest.Mocked<UserCommandService>;
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();

    const mockQueryService = {
      findUniqueOrThrowUserById: jest.fn(),
      findManyUsersById: jest.fn(),
      findAllUsers: jest.fn(),
    };

    const mockCommandService = {
      createUser: jest.fn(),
      createManyAndReturnUsers: jest.fn(),
      updateUserById: jest.fn(),
      deleteUserById: jest.fn(),
      deleteManyUsersById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppApiUsersController],
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

    controller = module.get<AppApiUsersController>(AppApiUsersController);
    queryService = module.get(UserQueryService);
    commandService = module.get(UserCommandService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get /users/:publicId', () => {
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

    it('should throw error when user not found', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      queryService.findUniqueOrThrowUserById.mockRejectedValue(new Error('User not found'));

      await expect(controller.findUniqueOrThrowUserById(publicId)).rejects.toThrow('User not found');
      expect(queryService.findUniqueOrThrowUserById).toHaveBeenCalledWith({ publicId });
    });
  });

  describe('post /users', () => {
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

  describe('put /users/:publicId', () => {
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
});
