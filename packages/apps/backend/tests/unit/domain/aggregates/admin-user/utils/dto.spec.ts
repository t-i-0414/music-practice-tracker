import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';

import {
  AdminUserResponseDto,
  FindManyAdminUsersByIdInputDto,
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
} from '@/domain/aggregates/admin-user/utils/dto';
import { AdminUserFactory } from '@/tests/factory/admin-user.factory';

describe('unit admin-user dto utilities', () => {
  describe('findManyAdminUsersByIdInputDto', () => {
    it('transforms comma separated string into array', () => {
      const dto = plainToInstance(FindManyAdminUsersByIdInputDto, { publicIds: 'x,y,z' });

      expect(dto.publicIds).toStrictEqual(['x', 'y', 'z']);
    });

    it('transforms strings into array of ids', () => {
      const dto = plainToInstance(FindManyAdminUsersByIdInputDto, { publicIds: ['x', 'y', 'z'] });

      expect(dto.publicIds).toStrictEqual(['x', 'y', 'z']);
    });
  });

  describe('toAdminUserResponseDto', () => {
    it('maps admin user entity into response dto', () => {
      const now = new Date('2024-01-01T00:00:00.000Z');
      const adminUser = {
        id: 1,
        publicId: 'admin-id',
        cognitoSub: 'sub',
        name: 'Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      } as unknown as Parameters<typeof toAdminUserResponseDto>[0];

      const result = toAdminUserResponseDto(adminUser);

      expect(result).toBeInstanceOf(AdminUserResponseDto);
      expect(result).not.toHaveProperty('id');
      expect(result.publicId).toBe('admin-id');
      expect(result.cognitoSub).toBe(adminUser.cognitoSub);
      expect(result.name).toBe(adminUser.name);
      expect(result.status).toBe(adminUser.status);
      expect(result.role).toBe(adminUser.role);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe(now.toISOString());
    });
  });

  describe('toAdminUsersResponseDto', () => {
    it('maps admin users list to response dto list', () => {
      const now = new Date();
      const adminUsers = new AdminUserFactory().buildMany(2, { createdAt: now, updatedAt: now });
      adminUsers[0].publicId = 'id-1';
      adminUsers[0].cognitoSub = 'sub-1';
      adminUsers[0].name = 'User 1';
      adminUsers[0].role = 'VIEWER';
      adminUsers[0].status = 'ACTIVE';

      const { adminUsers: users } = toAdminUsersResponseDto(adminUsers);

      expect(users).toBeInstanceOf(Array);
      expect(users).toHaveLength(2);

      const [result1] = users;

      expect(result1).toBeInstanceOf(AdminUserResponseDto);
      expect(result1).not.toHaveProperty('id');
      expect(result1.publicId).toBe('id-1');
      expect(result1.cognitoSub).toBe('sub-1');
      expect(result1.name).toBe('User 1');
      expect(result1.status).toBe('ACTIVE');
      expect(result1.role).toBe('VIEWER');
      expect(result1.createdAt).toBeInstanceOf(Date);
    });
  });
});
