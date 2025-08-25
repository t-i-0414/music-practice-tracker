import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/aggregates/user/user.command.service';
import { UserQueryService } from '@/aggregates/user/user.query.service';
import { toUserResponseDto } from '@/aggregates/user/user.response.dto';
import { AppUsersController } from '@/apis/app/users/users.controller';
import { UserResponseDtoFactory } from '@/tests/factory';

describe('appUsersController', () => {
  let controller: AppUsersController;
  let queryService: jest.Mocked<UserQueryService>;
  let commandService: jest.Mocked<UserCommandService>;
  let userResponseDtoFactory: UserResponseDtoFactory;

  beforeEach(async () => {
    userResponseDtoFactory = new UserResponseDtoFactory();

    const mockQueryService = {
      findUserByIdOrFail: jest.fn(),
    };

    const mockCommandService = {
      createUser: jest.fn(),
      updateUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUsersController],
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

    controller = module.get<AppUsersController>(AppUsersController);
    queryService = module.get(UserQueryService);
    commandService = module.get(UserCommandService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
});
