import { Test, TestingModule } from '@nestjs/testing';

import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import { toUserResponseDto, toUsersResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { AdminUsersController } from '@/modules/api/admin/users/users.controller';
import { buildUserResponseDto } from '@/tests/factory/user.factory';

describe('adminUsersController', () => {
  let controller: AdminUsersController;
  let facadeService: jest.Mocked<UserAdminFacadeService>;

  beforeEach(async () => {
    const mockFacadeService: jest.Mocked<UserAdminFacadeService> = {
      findUserById: jest.fn(),
      findDeletedUserById: jest.fn(),
      findAnyUserById: jest.fn(),
      findManyUsers: jest.fn(),
      findManyDeletedUsers: jest.fn(),
      findManyAnyUsers: jest.fn(),
      createUser: jest.fn(),
      createManyAndReturnUsers: jest.fn(),
      updateUserById: jest.fn(),
      deleteUserById: jest.fn(),
      deleteManyUsersById: jest.fn(),
      restoreUserById: jest.fn(),
      restoreManyUsersById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: UserAdminFacadeService,
          useValue: mockFacadeService,
        },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
    facadeService = module.get(UserAdminFacadeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findManyUsers', () => {
    it('should find many users with array of publicIds', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const publicIds = ['id1', 'id2'];
      const expectedResult = toUsersResponseDto([mockUser]);
      facadeService.findManyUsers.mockResolvedValue(expectedResult);

      const result = await controller.findManyUsers(publicIds);

      expect(facadeService.findManyUsers).toHaveBeenCalledWith({ publicIds });
      expect(result).toStrictEqual(expectedResult);
    });

    it('should find many users with single publicId string', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const publicId = 'id1';
      const expectedResult = toUsersResponseDto([mockUser]);
      facadeService.findManyUsers.mockResolvedValue(expectedResult);

      const result = await controller.findManyUsers(publicId);

      expect(facadeService.findManyUsers).toHaveBeenCalledWith({ publicIds: [publicId] });
      expect(result).toStrictEqual(expectedResult);
    });
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

  describe('createManyUsers', () => {
    it('should create many users', async () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const createDto = { users: [{ email: 'user1@example.com', name: 'User 1' }] };
      const expectedResult = toUsersResponseDto([mockUser]);
      facadeService.createManyAndReturnUsers.mockResolvedValue(expectedResult);

      const result = await controller.createManyUsers(createDto);

      expect(facadeService.createManyAndReturnUsers).toHaveBeenCalledWith(createDto);
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

  describe('deleteManyUsers', () => {
    it('should delete many users', async () => {
      expect.assertions(1);

      const dto = { publicIds: ['id1', 'id2'] };
      facadeService.deleteManyUsersById.mockResolvedValue();

      await controller.deleteManyUsers(dto);

      expect(facadeService.deleteManyUsersById).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      expect.assertions(1);

      const mockUser = buildUserResponseDto();
      const { publicId } = mockUser;
      facadeService.deleteUserById.mockResolvedValue();

      await controller.deleteUser(publicId);

      expect(facadeService.deleteUserById).toHaveBeenCalledWith({ publicId });
    });
  });
});
