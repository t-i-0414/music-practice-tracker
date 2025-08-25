import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AdminRole } from '@/generated/prisma';
import { AdminUserAdminFacadeService } from '@/aggregates/admin-user/admin-user.admin.facade.service';
import { CreateAdminUserInputDto, UpdateAdminUserInputDto } from '@/aggregates/admin-user/admin-user.input.dto';
import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/aggregates/admin-user/admin-user.response.dto';
import { AdminAdminUsersController } from '@/apis/admin/admin-users/admin-users.controller';
import { AdminUserFactory } from '@/tests/factory';

describe('admin admin users controller', () => {
  let controller: AdminAdminUsersController;
  let facadeService: jest.Mocked<AdminUserAdminFacadeService>;
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockFacadeService = {
      findAdminUserById: jest.fn(),
      findManyAdminUsers: jest.fn(),
      findAllAdminUsers: jest.fn(),
      createAdminUser: jest.fn(),
      createManyAndReturnAdminUsers: jest.fn(),
      updateAdminUserById: jest.fn(),
      deleteAdminUserById: jest.fn(),
      deleteManyAdminUsersById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAdminUsersController],
      providers: [
        {
          provide: AdminUserAdminFacadeService,
          useValue: mockFacadeService,
        },
      ],
    }).compile();

    controller = module.get<AdminAdminUsersController>(AdminAdminUsersController);
    facadeService = module.get(AdminUserAdminFacadeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get /admin-users', () => {
    it('should return all admin users when no publicIds provided', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      facadeService.findAllAdminUsers.mockResolvedValue(mockResponse);

      const result = await controller.findManyAdminUsers(undefined);

      expect(facadeService.findAllAdminUsers).toHaveBeenCalledWith();
      expect(result).toStrictEqual(mockResponse);
    });

    it('should return admin users by public IDs when provided', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      const publicIds = mockAdminUsers.map((user) => user.publicId);
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      facadeService.findManyAdminUsers.mockResolvedValue(mockResponse);

      const result = await controller.findManyAdminUsers(publicIds);

      expect(facadeService.findManyAdminUsers).toHaveBeenCalledWith({ publicIds });
      expect(result).toStrictEqual(mockResponse);
    });

    it('should handle string input for single ID', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const { publicId } = mockAdminUser;
      const mockResponse = toAdminUsersResponseDto([mockAdminUser]);
      facadeService.findManyAdminUsers.mockResolvedValue(mockResponse);

      const result = await controller.findManyAdminUsers(publicId);

      expect(facadeService.findManyAdminUsers).toHaveBeenCalledWith({ publicIds: [publicId] });
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('get /admin-users/:publicId', () => {
    it('should return admin user by public ID', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      facadeService.findAdminUserById.mockResolvedValue(mockResponseDto);

      const result = await controller.findAdminUserById(mockAdminUser.publicId);

      expect(facadeService.findAdminUserById).toHaveBeenCalledWith({ publicId: mockAdminUser.publicId });
      expect(result).toStrictEqual(mockResponseDto);
    });

    it('should throw NotFoundException when admin user not found', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      facadeService.findAdminUserById.mockRejectedValue(new NotFoundException('AdminUser not found'));

      await expect(controller.findAdminUserById(publicId)).rejects.toThrow(NotFoundException);
      expect(facadeService.findAdminUserById).toHaveBeenCalledWith({ publicId });
    });
  });

  describe('post /admin-users', () => {
    it('should create a new admin user', async () => {
      expect.assertions(2);

      const createDto: CreateAdminUserInputDto = {
        email: 'admin@example.com',
        name: 'New Admin',
        role: AdminRole.VIEWER,
      };
      const mockAdminUser = adminUserFactory.build(createDto);
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      facadeService.createAdminUser.mockResolvedValue(mockResponseDto);

      const result = await controller.createAdminUser(createDto);

      expect(facadeService.createAdminUser).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('post /admin-users/bulk', () => {
    it('should create multiple admin users', async () => {
      expect.assertions(2);

      const createDto = {
        adminUsers: [
          {
            email: 'admin1@example.com',
            name: 'Admin 1',
            role: AdminRole.VIEWER,
          },
          {
            email: 'admin2@example.com',
            name: 'Admin 2',
            role: AdminRole.ADMIN,
          },
        ],
      };
      const mockAdminUsers = [
        adminUserFactory.build(createDto.adminUsers[0]),
        adminUserFactory.build(createDto.adminUsers[1]),
      ];
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      facadeService.createManyAndReturnAdminUsers.mockResolvedValue(mockResponse);

      const result = await controller.createManyAdminUsers(createDto);

      expect(facadeService.createManyAndReturnAdminUsers).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('put /admin-users', () => {
    it('should update an admin user', async () => {
      expect.assertions(2);

      const publicId = 'admin-public-id';
      const updateDto: UpdateAdminUserInputDto = {
        publicId,
        data: {
          name: 'Updated Name',
          role: AdminRole.ADMIN,
        },
      };
      const mockUpdatedAdminUser = adminUserFactory.build({
        publicId,
        ...updateDto.data,
      });
      const mockResponseDto = toAdminUserResponseDto(mockUpdatedAdminUser);
      facadeService.updateAdminUserById.mockResolvedValue(mockResponseDto);

      const result = await controller.updateAdminUser(publicId, updateDto.data);

      expect(facadeService.updateAdminUserById).toHaveBeenCalledWith({ publicId, data: updateDto.data });
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('delete /admin-users/:publicId', () => {
    it('should delete an admin user', async () => {
      expect.assertions(2);

      const publicId = 'admin-public-id';
      facadeService.deleteAdminUserById.mockResolvedValue(undefined);

      await controller.deleteAdminUser(publicId);

      expect(facadeService.deleteAdminUserById).toHaveBeenCalledWith({ publicId });
      expect(facadeService.deleteAdminUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete /admin-users', () => {
    it('should delete multiple admin users', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2', 'id3'];
      const deleteDto = { publicIds };
      facadeService.deleteManyAdminUsersById.mockResolvedValue(undefined);

      await controller.deleteManyAdminUsers(deleteDto);

      expect(facadeService.deleteManyAdminUsersById).toHaveBeenCalledWith(deleteDto);
      expect(facadeService.deleteManyAdminUsersById).toHaveBeenCalledTimes(1);
    });
  });
});
