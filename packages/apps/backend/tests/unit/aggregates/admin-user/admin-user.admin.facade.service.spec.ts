import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AdminRole } from '@/generated/prisma';
import { AdminUserAdminFacadeService } from '@/aggregates/admin-user/admin-user.admin.facade.service';
import { AdminUserCommandService } from '@/aggregates/admin-user/admin-user.command.service';
import { AdminUserQueryService } from '@/aggregates/admin-user/admin-user.query.service';
import { toAdminUserResponseDto, toAdminUsersResponseDto } from '@/aggregates/admin-user/admin-user.response.dto';
import { AdminUserFactory } from '@/tests/factory';

describe('adminUserAdminFacadeService', () => {
  let service: AdminUserAdminFacadeService;
  let queryService: jest.Mocked<AdminUserQueryService>;
  let commandService: jest.Mocked<AdminUserCommandService>;
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockQueryService = {
      findAdminUserByIdOrFail: jest.fn(),
      findManyAdminUsers: jest.fn(),
      findAllAdminUsers: jest.fn(),
    };

    const mockCommandService = {
      createAdminUser: jest.fn(),
      createManyAndReturnAdminUsers: jest.fn(),
      updateAdminUserById: jest.fn(),
      deleteAdminUserById: jest.fn(),
      deleteManyAdminUsersById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserAdminFacadeService,
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

    service = module.get<AdminUserAdminFacadeService>(AdminUserAdminFacadeService);
    queryService = module.get(AdminUserQueryService);
    commandService = module.get(AdminUserCommandService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAdminUserById', () => {
    it('should return admin user when found', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      queryService.findAdminUserByIdOrFail.mockResolvedValue(mockResponseDto);

      const result = await service.findAdminUserById({ publicId: mockAdminUser.publicId });

      expect(queryService.findAdminUserByIdOrFail).toHaveBeenCalledWith({
        publicId: mockAdminUser.publicId,
      });
      expect(result).toStrictEqual(mockResponseDto);
    });

    it('should throw NotFoundException when admin user not found', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      queryService.findAdminUserByIdOrFail.mockRejectedValue(new NotFoundException('AdminUser not found'));

      await expect(service.findAdminUserById({ publicId })).rejects.toThrow(NotFoundException);
      expect(queryService.findAdminUserByIdOrFail).toHaveBeenCalledWith({
        publicId,
      });
    });
  });

  describe('findManyAdminUsers', () => {
    it('should return admin users by public IDs', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      const publicIds = mockAdminUsers.map((user) => user.publicId);
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      queryService.findManyAdminUsers.mockResolvedValue(mockResponse);

      const result = await service.findManyAdminUsers({ publicIds });

      expect(queryService.findManyAdminUsers).toHaveBeenCalledWith({ publicIds });
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('findAllAdminUsers', () => {
    it('should return all admin users', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build(), adminUserFactory.build()];
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      queryService.findAllAdminUsers.mockResolvedValue(mockResponse);

      const result = await service.findAllAdminUsers();

      expect(queryService.findAllAdminUsers).toHaveBeenCalledWith();
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('createAdminUser', () => {
    it('should create a new admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const createData = {
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: AdminRole.VIEWER,
      };
      const mockResponseDto = toAdminUserResponseDto(mockAdminUser);
      commandService.createAdminUser.mockResolvedValue(mockResponseDto);

      const result = await service.createAdminUser(createData);

      expect(commandService.createAdminUser).toHaveBeenCalledWith(createData);
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('createManyAndReturnAdminUsers', () => {
    it('should create multiple admin users', async () => {
      expect.assertions(2);

      const createData = {
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
        adminUserFactory.build(createData.adminUsers[0]),
        adminUserFactory.build(createData.adminUsers[1]),
      ];
      const mockResponse = toAdminUsersResponseDto(mockAdminUsers);
      commandService.createManyAndReturnAdminUsers.mockResolvedValue(mockResponse);

      const result = await service.createManyAndReturnAdminUsers(createData);

      expect(commandService.createManyAndReturnAdminUsers).toHaveBeenCalledWith(createData);
      expect(result).toStrictEqual(mockResponse);
    });
  });

  describe('updateAdminUserById', () => {
    it('should update an admin user', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const updateData = {
        publicId: mockAdminUser.publicId,
        data: {
          name: 'Updated Name',
          role: AdminRole.ADMIN,
        },
      };
      const updatedAdminUser = { ...mockAdminUser, ...updateData.data };
      const mockResponseDto = toAdminUserResponseDto(updatedAdminUser);

      commandService.updateAdminUserById.mockResolvedValue(mockResponseDto);

      const result = await service.updateAdminUserById(updateData);

      expect(commandService.updateAdminUserById).toHaveBeenCalledWith(updateData);
      expect(result).toStrictEqual(mockResponseDto);
    });
  });

  describe('deleteAdminUserById', () => {
    it('should delete an admin user', async () => {
      expect.assertions(2);

      const publicId = 'admin-public-id';

      commandService.deleteAdminUserById.mockResolvedValue(undefined);

      await service.deleteAdminUserById({ publicId });

      expect(commandService.deleteAdminUserById).toHaveBeenCalledWith({ publicId });
      expect(commandService.deleteAdminUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteManyAdminUsersById', () => {
    it('should delete multiple admin users', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2', 'id3'];

      commandService.deleteManyAdminUsersById.mockResolvedValue(undefined);

      await service.deleteManyAdminUsersById({ publicIds });

      expect(commandService.deleteManyAdminUsersById).toHaveBeenCalledWith({ publicIds });
      expect(commandService.deleteManyAdminUsersById).toHaveBeenCalledTimes(1);
    });
  });
});
