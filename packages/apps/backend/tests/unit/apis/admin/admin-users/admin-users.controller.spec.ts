import { Test } from '@nestjs/testing';

import { AdminApiAdminUsersController } from '@/apis/admin/admin-users/admin-users.controller';
import { AdminUserCommandService } from '@/domain/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/domain/aggregates/admin-user/admin-user.query.service';
import {
  CreateAdminUserInputDto,
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
} from '@/domain/aggregates/admin-user/utils/dto';
import { AdminRole } from '@/generated/prisma';
import { AdminUserFactory } from '@/tests/factory';
import { resetAllMocks } from '@/tests/helpers/mock-service.helper';

describe('controller AdminApiAdminUsersController', () => {
  let controller: AdminApiAdminUsersController;
  let queryService: jest.Mocked<AdminUserQueryService>;
  let commandService: jest.Mocked<AdminUserCommandService>;
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockQueryService = jest.mocked({
      findUniqueOrThrowAdminUser: jest.fn(),
      findManyAdminUsersById: jest.fn(),
      findAllAdminUsers: jest.fn(),
    });
    const mockCommandService = jest.mocked({
      createAdminUser: jest.fn(),
      createManyAndReturnAdminUsers: jest.fn(),
      updateAdminUserById: jest.fn(),
      deleteAdminUserById: jest.fn(),
      deleteManyAdminUsersByIds: jest.fn(),
    });

    const module = await Test.createTestingModule({
      controllers: [AdminApiAdminUsersController],
      providers: [
        {
          provide: AdminUserQueryService,
          useValue: mockQueryService,
        },
        {
          provide: AdminUserCommandService,
          useValue: mockCommandService,
        },
      ],
    }).compile();

    controller = module.get<AdminApiAdminUsersController>(AdminApiAdminUsersController);
    queryService = module.get<jest.Mocked<AdminUserQueryService>>(AdminUserQueryService);
    commandService = module.get<jest.Mocked<AdminUserCommandService>>(AdminUserCommandService);
  });

  afterEach(() => {
    resetAllMocks(queryService, commandService);
  });

  describe('get /admin/admin-users', () => {
    it('should return admin users by public IDs', async () => {
      expect.assertions(2);

      const mockAdminUsers = adminUserFactory.buildMany(2);
      const publicIds = mockAdminUsers.map((user) => user.publicId);
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      queryService.findManyAdminUsersById.mockResolvedValue(mockResponse);

      const result = await controller.findManyAdminUsers({ publicIds });

      expect(queryService.findManyAdminUsersById).toHaveBeenCalledWith({ publicIds });
      expect(result).toStrictEqual(mockResponse);
    });

    it('should handle string input for single ID', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const { publicId } = mockAdminUser;
      const mockResponse = toAdminUsersResponseDto([mockAdminUser]);
      queryService.findManyAdminUsersById.mockResolvedValue(mockResponse);

      const result = await controller.findManyAdminUsers({ publicIds: [publicId] });

      expect(queryService.findManyAdminUsersById).toHaveBeenCalledWith({ publicIds: [publicId] });
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('post /admin/admin-users', () => {
    it('should create a new admin user', async () => {
      expect.assertions(2);

      const createDto: CreateAdminUserInputDto = {
        cognitoSub: 'sub-admin',
        name: 'New Admin',
        role: AdminRole.VIEWER,
      };
      const mockAdminUser = adminUserFactory.build(createDto);
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      commandService.createAdminUser.mockResolvedValue(mockResponseDto);

      const result = await controller.createAdminUser(createDto);

      expect(commandService.createAdminUser).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('delete /admin/admin-users', () => {
    it('should delete multiple admin users', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2', 'id3'];
      const deleteDto = { publicIds };
      commandService.deleteManyAdminUsersByIds.mockResolvedValue(undefined);

      await controller.deleteManyAdminUsers(deleteDto);

      expect(commandService.deleteManyAdminUsersByIds).toHaveBeenCalledWith(deleteDto);
      expect(commandService.deleteManyAdminUsersByIds).toHaveBeenCalledTimes(1);
    });
  });

  describe('post /admin/admin-users/bulk', () => {
    it('should create multiple admin users', async () => {
      expect.assertions(2);

      const createDto = {
        adminUsers: [
          { cognitoSub: 'sub-admin1', name: 'Admin 1', role: AdminRole.VIEWER },
          { cognitoSub: 'sub-admin2', name: 'Admin 2', role: AdminRole.ADMIN },
        ],
      };
      const mockAdminUsers = [
        adminUserFactory.build(createDto.adminUsers[0]),
        adminUserFactory.build(createDto.adminUsers[1]),
      ];
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      commandService.createManyAndReturnAdminUsers.mockResolvedValue(mockResponse);

      const result = await controller.createManyAdminUsers(createDto);

      expect(commandService.createManyAndReturnAdminUsers).toHaveBeenCalledWith(createDto);
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('get /admin/admin-users/:publicId', () => {
    it('should return admin user by public ID', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(mockResponseDto);

      const result = await controller.findAdminUserById(mockAdminUser.publicId);

      expect(queryService.findUniqueOrThrowAdminUser).toHaveBeenCalledWith({
        publicId: mockAdminUser.publicId,
      });
      expect(result).toStrictEqual(mockResponseDto);
    });

    it('should throw error when admin user not found', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      queryService.findUniqueOrThrowAdminUser.mockRejectedValue(new Error('Admin user not found'));

      await expect(controller.findAdminUserById(publicId)).rejects.toMatchObject({ message: 'Admin user not found' });
      expect(queryService.findUniqueOrThrowAdminUser).toHaveBeenCalledWith({ publicId });
    });
  });

  describe('put /admin/admin-users/:publicId', () => {
    it('should update an admin user', async () => {
      expect.assertions(2);

      const publicId = 'admin-public-id';
      const updateData = {
        name: 'Updated Name',
        role: AdminRole.ADMIN,
      };
      const mockUpdatedAdminUser = adminUserFactory.build({
        publicId,
        ...updateData,
      });
      const mockResponseDto = toAdminUserResponseDto(mockUpdatedAdminUser);
      commandService.updateAdminUserById.mockResolvedValue(mockResponseDto);

      const result = await controller.updateAdminUser(publicId, updateData);

      expect(commandService.updateAdminUserById).toHaveBeenCalledWith({ publicId, data: updateData });
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('delete /admin/admin-users/:publicId', () => {
    it('should delete an admin user', async () => {
      expect.assertions(2);

      const publicId = 'admin-public-id';
      commandService.deleteAdminUserById.mockResolvedValue(undefined);

      await controller.deleteAdminUser(publicId);

      expect(commandService.deleteAdminUserById).toHaveBeenCalledWith({ publicId });
      expect(commandService.deleteAdminUserById).toHaveBeenCalledTimes(1);
    });
  });
});
