import { plainToInstance } from 'class-transformer';

import {
  AdminUserResponseDto,
  AdminUsersResponseDto,
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
} from '@/aggregates/admin-user/admin-user.response.dto';
import { AdminRole, AdminStatus } from '@/generated/prisma';
import { AdminUserFactory } from '@/tests/factory';

describe('adminUserResponseDto', () => {
  let adminUserFactory: AdminUserFactory;

  beforeEach(() => {
    adminUserFactory = new AdminUserFactory();
  });

  describe('toAdminUserResponseDto', () => {
    it('should transform admin user to response DTO', () => {
      expect.assertions(8);

      const mockAdminUser = adminUserFactory.build();
      const dto = toAdminUserResponseDto(mockAdminUser);

      expect(dto.publicId).toBe(mockAdminUser.publicId);
      expect(dto.email).toBe(mockAdminUser.email);
      expect(dto.name).toBe(mockAdminUser.name);
      expect(dto.role).toBe(mockAdminUser.role);
      expect(dto.status).toBe(mockAdminUser.status);
      expect(dto.createdAt).toStrictEqual(mockAdminUser.createdAt);
      expect(dto.updatedAt).toStrictEqual(mockAdminUser.updatedAt);
      expect(dto).not.toHaveProperty('id');
    });

    it('should exclude internal id from response', () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const dto = toAdminUserResponseDto(mockAdminUser);

      expect(dto).not.toHaveProperty('id');
      expect(Object.keys(dto)).not.toContain('id');
    });

    it('should handle different roles correctly', () => {
      expect.assertions(7);

      const roles = [
        AdminRole.SUPER_ADMIN,
        AdminRole.ADMIN,
        AdminRole.EDITOR,
        AdminRole.MODERATOR,
        AdminRole.ANALYST,
        AdminRole.VIEWER,
      ];

      roles.forEach((role) => {
        const mockAdminUser = adminUserFactory.build({ role });
        const dto = toAdminUserResponseDto(mockAdminUser);

        expect(dto.role).toBe(role);
      });

      expect(roles).toHaveLength(6);
    });

    it('should handle different statuses correctly', () => {
      expect.assertions(5);

      const statuses = [AdminStatus.ACTIVE, AdminStatus.INACTIVE, AdminStatus.SUSPENDED, AdminStatus.PENDING];

      statuses.forEach((status) => {
        const mockAdminUser = adminUserFactory.build({ status });
        const dto = toAdminUserResponseDto(mockAdminUser);

        expect(dto.status).toBe(status);
      });

      expect(statuses).toHaveLength(4);
    });

    it('should handle date objects correctly', () => {
      expect.assertions(3);

      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-15');

      const mockAdminUser = adminUserFactory.build({
        createdAt,
        updatedAt,
      });
      const dto = toAdminUserResponseDto(mockAdminUser);

      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.createdAt).toStrictEqual(createdAt);
      expect(dto.updatedAt).toStrictEqual(updatedAt);
    });
  });

  describe('toAdminUsersResponseDto', () => {
    it('should transform array of admin users to response DTO', () => {
      expect.assertions(3);

      const mockAdminUsers = [adminUserFactory.build(), adminUserFactory.build(), adminUserFactory.build()];
      const dto = toAdminUsersResponseDto(mockAdminUsers);

      expect(dto).toHaveProperty('adminUsers');
      expect(dto.adminUsers).toHaveLength(3);
      expect(dto.adminUsers[0]).not.toHaveProperty('id');
    });

    it('should handle empty array', () => {
      expect.assertions(2);

      const dto = toAdminUsersResponseDto([]);

      expect(dto).toHaveProperty('adminUsers');
      expect(dto.adminUsers).toStrictEqual([]);
    });
  });

  describe('toJSON', () => {
    it('should serialize correctly', () => {
      expect.assertions(2);

      const mockAdminUser = adminUserFactory.build();
      const dto = toAdminUserResponseDto(mockAdminUser);
      const json = JSON.stringify(dto);
      const parsed = JSON.parse(json);

      expect(parsed).not.toHaveProperty('id');
      expect(parsed.publicId).toBe(mockAdminUser.publicId);
    });
  });

  describe('adminUsersResponseDto class', () => {
    it('should create instance with adminUsers property', () => {
      expect.assertions(2);

      const dto = new AdminUsersResponseDto();
      dto.adminUsers = [];

      expect(dto).toBeInstanceOf(AdminUsersResponseDto);
      expect(dto).toHaveProperty('adminUsers');
    });

    it('should transform plain object with @Type decorator', () => {
      expect.assertions(4);

      const mockAdminUser1 = adminUserFactory.build();
      const mockAdminUser2 = adminUserFactory.build();

      const plainData = {
        adminUsers: [mockAdminUser1, mockAdminUser2],
      };

      const dto = plainToInstance(AdminUsersResponseDto, plainData);

      expect(dto).toBeInstanceOf(AdminUsersResponseDto);
      expect(dto.adminUsers).toHaveLength(2);
      expect(dto.adminUsers[0]).toBeInstanceOf(AdminUserResponseDto);
      expect(dto.adminUsers[1]).toBeInstanceOf(AdminUserResponseDto);
    });

    it('should exclude internal fields when transforming with @Type', () => {
      expect.assertions(3);

      const mockAdminUser = adminUserFactory.build();
      const plainData = {
        adminUsers: [mockAdminUser],
      };

      const dto = plainToInstance(AdminUsersResponseDto, plainData);
      const [transformedUser] = dto.adminUsers;

      expect(transformedUser).not.toHaveProperty('id');
      expect(transformedUser.publicId).toBe(mockAdminUser.publicId);
      expect(transformedUser.email).toBe(mockAdminUser.email);
    });

    it('should properly serialize dates with @Type decorator', () => {
      expect.assertions(3);

      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-15');
      const mockAdminUser = adminUserFactory.build({ createdAt, updatedAt });

      const plainData = {
        adminUsers: [mockAdminUser],
      };

      const dto = plainToInstance(AdminUsersResponseDto, plainData);
      const [transformedUser] = dto.adminUsers;

      expect(transformedUser.createdAt).toBeInstanceOf(Date);
      expect(transformedUser.createdAt).toStrictEqual(createdAt);
      expect(transformedUser.updatedAt).toStrictEqual(updatedAt);
    });

    it('should handle empty array transformation', () => {
      expect.assertions(2);

      const plainData = {
        adminUsers: [],
      };

      const dto = plainToInstance(AdminUsersResponseDto, plainData);

      expect(dto.adminUsers).toStrictEqual([]);
      expect(dto.adminUsers).toHaveLength(0);
    });

    it('should maintain all admin user properties after transformation', () => {
      expect.assertions(7);

      const mockAdminUser = adminUserFactory.build({
        role: AdminRole.SUPER_ADMIN,
        status: AdminStatus.ACTIVE,
      });

      const plainData = {
        adminUsers: [mockAdminUser],
      };

      const dto = plainToInstance(AdminUsersResponseDto, plainData);
      const [transformedUser] = dto.adminUsers;

      expect(transformedUser.publicId).toBe(mockAdminUser.publicId);
      expect(transformedUser.email).toBe(mockAdminUser.email);
      expect(transformedUser.name).toBe(mockAdminUser.name);
      expect(transformedUser.role).toBe(AdminRole.SUPER_ADMIN);
      expect(transformedUser.status).toBe(AdminStatus.ACTIVE);
      expect(transformedUser.createdAt).toStrictEqual(mockAdminUser.createdAt);
      expect(transformedUser.updatedAt).toStrictEqual(mockAdminUser.updatedAt);
    });
  });
});
