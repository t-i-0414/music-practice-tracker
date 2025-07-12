import { Test, TestingModule } from '@nestjs/testing';

import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import {
  toActiveUserDto,
  toActiveUsersDto,
  toDeletedUserDto,
  toDeletedUsersDto,
  toAnyUserDto,
  toAnyUsersDto,
} from '@/modules/aggregate/user/user.response.dto';
import { AdminUsersController } from '@/modules/api/admin/users/users.controller';

describe('adminUsersController', () => {
  let controller: AdminUsersController;
  let facadeService: jest.Mocked<UserAdminFacadeService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockDeletedUser = {
    ...mockUser,
    deletedAt: new Date('2024-01-02'),
  };

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
      hardDeleteUserById: jest.fn(),
      hardDeleteManyUsersById: jest.fn(),
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
    it('should find many active users with array of ids', async () => {
      expect.assertions(2);

      const ids = ['id1', 'id2'];
      const expectedResult = toActiveUsersDto([mockUser]);
      facadeService.findManyUsers.mockResolvedValue(expectedResult);

      const result = await controller.findManyUsers(ids);

      expect(facadeService.findManyUsers).toHaveBeenCalledWith({ ids });
      expect(result).toStrictEqual(expectedResult);
    });

    it('should find many active users with single id string', async () => {
      expect.assertions(2);

      const id = 'id1';
      const expectedResult = toActiveUsersDto([mockUser]);
      facadeService.findManyUsers.mockResolvedValue(expectedResult);

      const result = await controller.findManyUsers(id);

      expect(facadeService.findManyUsers).toHaveBeenCalledWith({ ids: [id] });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findUserById', () => {
    it('should find active user by id', async () => {
      expect.assertions(2);

      const { id } = mockUser;
      const expectedResult = toActiveUserDto(mockUser);
      facadeService.findUserById.mockResolvedValue(expectedResult);

      const result = await controller.findUserById(id);

      expect(facadeService.findUserById).toHaveBeenCalledWith({ id });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findManyDeletedUsers', () => {
    it('should find many deleted users with array of ids', async () => {
      expect.assertions(2);

      const ids = ['id1', 'id2'];
      const expectedResult = toDeletedUsersDto([mockDeletedUser]);
      facadeService.findManyDeletedUsers.mockResolvedValue(expectedResult);

      const result = await controller.findManyDeletedUsers(ids);

      expect(facadeService.findManyDeletedUsers).toHaveBeenCalledWith({ ids });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findDeletedUserById', () => {
    it('should find deleted user by id', async () => {
      expect.assertions(2);

      const { id } = mockDeletedUser;
      const expectedResult = toDeletedUserDto(mockDeletedUser);
      facadeService.findDeletedUserById.mockResolvedValue(expectedResult);

      const result = await controller.findDeletedUserById(id);

      expect(facadeService.findDeletedUserById).toHaveBeenCalledWith({ id });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findManyAnyUsers', () => {
    it('should find many any users with array of ids', async () => {
      expect.assertions(2);

      const ids = ['id1', 'id2'];
      const expectedResult = toAnyUsersDto([mockUser, mockDeletedUser]);
      facadeService.findManyAnyUsers.mockResolvedValue(expectedResult);

      const result = await controller.findManyAnyUsers(ids);

      expect(facadeService.findManyAnyUsers).toHaveBeenCalledWith({ ids });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findAnyUserById', () => {
    it('should find any user by id', async () => {
      expect.assertions(2);

      const { id } = mockUser;
      const expectedResult = toAnyUserDto(mockUser);
      facadeService.findAnyUserById.mockResolvedValue(expectedResult);

      const result = await controller.findAnyUserById(id);

      expect(facadeService.findAnyUserById).toHaveBeenCalledWith({ id });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createUser', () => {
    it('should create user', async () => {
      expect.assertions(2);

      const createDto = { email: mockUser.email, name: mockUser.name };
      const expectedResult = toActiveUserDto(mockUser);
      facadeService.createUser.mockResolvedValue(expectedResult);

      const result = await controller.createUser(createDto);

      expect(facadeService.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('createManyUsers', () => {
    it('should create many users', async () => {
      expect.assertions(2);

      const createDto = { users: [{ email: 'user1@example.com', name: 'User 1' }] };
      const expectedResult = toActiveUsersDto([mockUser]);
      facadeService.createManyAndReturnUsers.mockResolvedValue(expectedResult);

      const result = await controller.createManyUsers(createDto);

      expect(facadeService.createManyAndReturnUsers).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      expect.assertions(2);

      const { id } = mockUser;
      const data = { name: 'Updated Name' };
      const expectedResult = toActiveUserDto({ ...mockUser, name: 'Updated Name' });
      facadeService.updateUserById.mockResolvedValue(expectedResult);

      const result = await controller.updateUser(id, data);

      expect(facadeService.updateUserById).toHaveBeenCalledWith({ id, data });
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('deleteManyUsers', () => {
    it('should delete many users', async () => {
      expect.assertions(1);

      const dto = { ids: ['id1', 'id2'] };
      facadeService.deleteManyUsersById.mockResolvedValue();

      await controller.deleteManyUsers(dto);

      expect(facadeService.deleteManyUsersById).toHaveBeenCalledWith(dto);
    });
  });

  describe('hardDeleteManyUsers', () => {
    it('should hard delete many users', async () => {
      expect.assertions(1);

      const dto = { ids: ['id1', 'id2'] };
      facadeService.hardDeleteManyUsersById.mockResolvedValue();

      await controller.hardDeleteManyUsers(dto);

      expect(facadeService.hardDeleteManyUsersById).toHaveBeenCalledWith(dto);
    });
  });

  describe('hardDeleteUser', () => {
    it('should hard delete user', async () => {
      expect.assertions(1);

      const { id } = mockUser;
      facadeService.hardDeleteUserById.mockResolvedValue();

      await controller.hardDeleteUser(id);

      expect(facadeService.hardDeleteUserById).toHaveBeenCalledWith({ id });
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      expect.assertions(1);

      const { id } = mockUser;
      facadeService.deleteUserById.mockResolvedValue();

      await controller.deleteUser(id);

      expect(facadeService.deleteUserById).toHaveBeenCalledWith({ id });
    });
  });

  describe('restoreManyUsers', () => {
    it('should restore many users', async () => {
      expect.assertions(2);

      const dto = { ids: ['id1', 'id2'] };
      const expectedResult = toActiveUsersDto([mockUser]);
      facadeService.restoreManyUsersById.mockResolvedValue(expectedResult);

      const result = await controller.restoreManyUsers(dto);

      expect(facadeService.restoreManyUsersById).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('restoreUser', () => {
    it('should restore user', async () => {
      expect.assertions(2);

      const { id } = mockDeletedUser;
      const expectedResult = toActiveUserDto({ ...mockDeletedUser, deletedAt: null });
      facadeService.restoreUserById.mockResolvedValue(expectedResult);

      const result = await controller.restoreUser(id);

      expect(facadeService.restoreUserById).toHaveBeenCalledWith({ id });
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
