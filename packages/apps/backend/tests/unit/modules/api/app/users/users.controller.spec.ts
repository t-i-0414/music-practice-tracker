import { Test, TestingModule } from '@nestjs/testing';

import { UserStatus } from '@/generated/prisma';
import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import { toUserResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { AppUsersController } from '@/modules/api/app/users/users.controller';

describe('appUsersController', () => {
  let controller: AppUsersController;
  let facadeService: jest.Mocked<UserAppFacadeService>;

  const mockUser = {
    publicId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockFacadeService: jest.Mocked<UserAppFacadeService> = {
      findUserById: jest.fn(),
      createUser: jest.fn(),
      updateUserById: jest.fn(),
      deleteUserById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUsersController],
      providers: [
        {
          provide: UserAppFacadeService,
          useValue: mockFacadeService,
        },
      ],
    }).compile();

    controller = module.get<AppUsersController>(AppUsersController);
    facadeService = module.get(UserAppFacadeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it('should find user by publicId', async () => {
      expect.assertions(2);

      const { publicId } = mockUser;
      const expectedResult = toUserResponseDto(mockUser);
      facadeService.findUserById.mockResolvedValue(expectedResult);

      const result = await controller.findUserById(publicId);

      expect(facadeService.findUserById).toHaveBeenCalledWith({ publicId });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createUser', () => {
    it('should create user', async () => {
      expect.assertions(2);

      const createDto = { email: mockUser.email, name: mockUser.name };
      const expectedResult = toUserResponseDto(mockUser);
      facadeService.createUser.mockResolvedValue(expectedResult);

      const result = await controller.createUser(createDto);

      expect(facadeService.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      expect.assertions(2);

      const { publicId } = mockUser;
      const data = { name: 'Updated Name' };
      const expectedResult = toUserResponseDto({ ...mockUser, name: 'Updated Name' });
      facadeService.updateUserById.mockResolvedValue(expectedResult);

      const result = await controller.updateUser(publicId, data);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({ publicId, data });
      expect(result).toStrictEqual(expectedResult);
    });
  });

});
