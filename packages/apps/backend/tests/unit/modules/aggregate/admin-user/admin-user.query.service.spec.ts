import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AdminUserQueryService } from '@/modules/aggregate/admin-user/admin-user.query.service';
import { AdminUserRepositoryService } from '@/modules/aggregate/admin-user/admin-user.repository.service';
import {
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
} from '@/modules/aggregate/admin-user/admin-user.response.dto';
import { AdminUserFactory } from '@/tests/factory';

describe('adminUserQueryService', () => {
  let service: AdminUserQueryService;
  let repository: jest.Mocked<AdminUserRepositoryService>;
  let adminUserFactory: AdminUserFactory;

  beforeEach(async () => {
    adminUserFactory = new AdminUserFactory();

    const mockRepository = {
      findUniqueAdminUser: jest.fn(),
      findManyAdminUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserQueryService,
        {
          provide: AdminUserRepositoryService,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AdminUserQueryService>(AdminUserQueryService);
    repository = module.get(AdminUserRepositoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAdminUserByIdOrFail', () => {
    it('should return admin user response DTO when found', async () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      repository.findUniqueAdminUser.mockResolvedValue(mockAdminUser);
      const params = { publicId: mockAdminUser.publicId };

      const result = await service.findAdminUserByIdOrFail(params);

      expect(repository.findUniqueAdminUser).toHaveBeenCalledWith(params);
      expect(result).toStrictEqual(toAdminUserResponseDto(mockAdminUser));
    });

    it('should throw NotFoundException when admin user not found', async () => {
      expect.assertions(2);

      repository.findUniqueAdminUser.mockResolvedValue(null);
      const params = { publicId: 'non-existent-id' };

      await expect(service.findAdminUserByIdOrFail(params)).rejects.toThrow(NotFoundException);
      expect(repository.findUniqueAdminUser).toHaveBeenCalledWith(params);
    });

    it('should throw NotFoundException with proper message', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      repository.findUniqueAdminUser.mockResolvedValue(null);
      const params = { publicId };

      await expect(service.findAdminUserByIdOrFail(params)).rejects.toThrow(`AdminUser ${publicId} not found`);
      expect(repository.findUniqueAdminUser).toHaveBeenCalledWith(params);
    });
  });

  describe('findManyAdminUsers', () => {
    it('should return admin users response DTO', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build()];
      const publicIds = mockAdminUsers.map((user) => user.publicId);
      repository.findManyAdminUsers.mockResolvedValue(mockAdminUsers);

      const result = await service.findManyAdminUsers({ publicIds });

      expect(repository.findManyAdminUsers).toHaveBeenCalledWith({
        where: {
          publicId: { in: publicIds },
        },
      });
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });

    it('should return empty response when no admin users found', async () => {
      expect.assertions(2);

      const publicIds = ['id1', 'id2'];
      repository.findManyAdminUsers.mockResolvedValue([]);

      const result = await service.findManyAdminUsers({ publicIds });

      expect(repository.findManyAdminUsers).toHaveBeenCalledWith({
        where: {
          publicId: { in: publicIds },
        },
      });
      expect(result).toStrictEqual(toAdminUsersResponseDto([]));
    });
  });

  describe('findAllAdminUsers', () => {
    it('should return all admin users', async () => {
      expect.assertions(2);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build(), adminUserFactory.build()];
      repository.findManyAdminUsers.mockResolvedValue(mockAdminUsers);

      const result = await service.findAllAdminUsers();

      expect(repository.findManyAdminUsers).toHaveBeenCalledWith({});
      expect(result).toStrictEqual(toAdminUsersResponseDto(mockAdminUsers));
    });

    it('should return empty response when no admin users exist', async () => {
      expect.assertions(2);

      repository.findManyAdminUsers.mockResolvedValue([]);

      const result = await service.findAllAdminUsers();

      expect(repository.findManyAdminUsers).toHaveBeenCalledWith({});
      expect(result).toStrictEqual(toAdminUsersResponseDto([]));
    });
  });
});
