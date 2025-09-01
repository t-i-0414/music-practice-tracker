import { Test, TestingModule } from '@nestjs/testing';

import { AdminUserCommandService } from '@/aggregates/admin-user/command.service';
import {
  CreateAdminUserInputDto,
  UpdateAdminUserInputDto,
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
} from '@/aggregates/admin-user/dto';
import { AdminUserError } from '@/aggregates/admin-user/error';
import { AdminUserQueryService } from '@/aggregates/admin-user/query.service';
import { AdminApiAdminUsersController } from '@/apis/admin/admin-users/admin-users.controller';
import { BusinessException } from '@/common/exceptions/business.exception';
import { AdminRole } from '@/generated/prisma';
import { AdminUserFactory } from '@/tests/factory';
import { Ok, Err } from '@/utils/result';

describe('admin admin users controller', () => {
  let controller: AdminApiAdminUsersController;
  let queryService: jest.Mocked<AdminUserQueryService>;
  let commandService: jest.Mocked<AdminUserCommandService>;
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockQueryService = {
      findUniqueOrThrowAdminUser: jest.fn(),
      findManyAdminUsers: jest.fn(),
      findAllAdminUsers: jest.fn(),
    };

    const mockCommandService = {
      createAdminUser: jest.fn(),
      createManyAndReturnAdminUsers: jest.fn(),
      updateAdminUserById: jest.fn(),
      deleteAdminUserById: jest.fn(),
      deleteManyAdminUsersByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
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
    queryService = module.get(AdminUserQueryService);
    commandService = module.get(AdminUserCommandService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get /admin-users', () => {
    it('should return all admin users when no publicIds provided', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      queryService.findAllAdminUsers.mockResolvedValue(Ok(mockResponse));

      const result = await controller.findManyAdminUsers(undefined);

      expect(queryService.findAllAdminUsers).toHaveBeenCalledWith();
      expect(result).toStrictEqual(mockResponse);
    });

    it('should return admin users by public IDs when provided', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      const publicIds = mockAdminUsers.map((user) => user.publicId);
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      queryService.findManyAdminUsers.mockResolvedValue(Ok(mockResponse));

      const result = await controller.findManyAdminUsers(publicIds);

      expect(queryService.findManyAdminUsers).toHaveBeenCalledWith({ publicIds });
      expect(result).toStrictEqual(mockResponse);
    });

    it('should handle string input for single ID', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const { publicId } = mockAdminUser;
      const mockResponse = toAdminUsersResponseDto([mockAdminUser]);
      queryService.findManyAdminUsers.mockResolvedValue(Ok(mockResponse));

      const result = await controller.findManyAdminUsers(publicId);

      expect(queryService.findManyAdminUsers).toHaveBeenCalledWith({ publicIds: [publicId] });
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('get /admin-users/:publicId', () => {
    it('should return admin user by public ID', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(Ok(mockResponseDto));

      const result = await controller.findAdminUserById(mockAdminUser.publicId);

      expect(queryService.findUniqueOrThrowAdminUser).toHaveBeenCalledWith({
        publicId: mockAdminUser.publicId,
      });
      expect(result).toStrictEqual(mockResponseDto);
    });

    it('should throw NotFoundException when admin user not found', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      queryService.findUniqueOrThrowAdminUser.mockResolvedValue(Err(AdminUserError.notFound(publicId)));

      await expect(controller.findAdminUserById(publicId)).rejects.toThrow(BusinessException);
      expect(queryService.findUniqueOrThrowAdminUser).toHaveBeenCalledWith({ publicId });
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
      commandService.createAdminUser.mockResolvedValue(Ok(mockResponseDto));

      const result = await controller.createAdminUser(createDto);

      expect(commandService.createAdminUser).toHaveBeenCalledWith(createDto);
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
      commandService.createManyAndReturnAdminUsers.mockResolvedValue(Ok(mockResponse));

      const result = await controller.createManyAdminUsers(createDto);

      expect(commandService.createManyAndReturnAdminUsers).toHaveBeenCalledWith(createDto);
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
      commandService.updateAdminUserById.mockResolvedValue(Ok(mockResponseDto));

      const result = await controller.updateAdminUser(publicId, updateDto.data);

      expect(commandService.updateAdminUserById).toHaveBeenCalledWith({ publicId, data: updateDto.data });
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('delete /admin-users/:publicId', () => {
    it('should delete an admin user', async () => {
      expect.assertions(2);

      const publicId = 'admin-public-id';
      commandService.deleteAdminUserById.mockResolvedValue(Ok(undefined));

      await controller.deleteAdminUser(publicId);

      expect(commandService.deleteAdminUserById).toHaveBeenCalledWith({ publicId });
      expect(commandService.deleteAdminUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete /admin-users', () => {
    it('should delete multiple admin users', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2', 'id3'];
      const deleteDto = { publicIds };
      commandService.deleteManyAdminUsersByIds.mockResolvedValue(Ok(undefined));

      await controller.deleteManyAdminUsers(deleteDto);

      expect(commandService.deleteManyAdminUsersByIds).toHaveBeenCalledWith(deleteDto);
      expect(commandService.deleteManyAdminUsersByIds).toHaveBeenCalledTimes(1);
    });
  });
});
