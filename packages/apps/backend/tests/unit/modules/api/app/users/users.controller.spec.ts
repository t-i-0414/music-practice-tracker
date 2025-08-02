import { Test, TestingModule } from '@nestjs/testing';

import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import { toUserResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { AppUsersController } from '@/modules/api/app/users/users.controller';
import { buildUserResponseDto } from '@/tests/factory/user.factory';

describe('appUsersController', () => {
  let controller: AppUsersController;
  let facadeService: jest.Mocked<UserAppFacadeService>;

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

      const mockUser = buildUserResponseDto();
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

      const mockUser = buildUserResponseDto();
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

      const mockUser = buildUserResponseDto();
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
