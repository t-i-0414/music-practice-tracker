import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import {
  UpdateAdminUserInputDto,
  AdminUsersResponseDto,
  AdminUserResponseDto,
} from '@/domain/aggregates/admin-user/utils/dto';
import { AdminRole } from '@/generated/prisma';

describe('unit AdminUser DTOs', () => {
  describe('updateAdminUserInputDto', () => {
    it('should transform and validate nested data object', async () => {
      expect.assertions(3);

      const plainObject = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          name: 'Updated Admin',
          role: AdminRole.ADMIN,
        },
      };

      const dto = plainToClass(UpdateAdminUserInputDto, plainObject);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.publicId).toBe(plainObject.publicId);
      expect(dto.data).toMatchObject(plainObject.data);
    });

    it('should fail validation with invalid data', async () => {
      expect.assertions(2);

      const plainObject = {
        publicId: 'invalid-uuid',
        data: {},
      };

      const dto = plainToClass(UpdateAdminUserInputDto, plainObject);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'publicId')).toBe(true);
    });

    it('should fail validation with missing data', async () => {
      expect.assertions(2);

      const plainObject = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const dto = plainToClass(UpdateAdminUserInputDto, plainObject as any);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'data')).toBe(true);
    });
  });

  describe('adminUsersResponseDto', () => {
    it('should transform array of admin users', () => {
      expect.assertions(3);

      const plainObject = {
        adminUsers: [
          {
            publicId: '123e4567-e89b-12d3-a456-426614174000',
            cognitoSub: 'sub-admin1',
            name: 'Admin 1',
            role: AdminRole.ADMIN,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            publicId: '223e4567-e89b-12d3-a456-426614174000',
            cognitoSub: 'sub-admin2',
            name: 'Admin 2',
            role: AdminRole.VIEWER,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      };

      const dto = plainToClass(AdminUsersResponseDto, plainObject);

      expect(dto.adminUsers).toHaveLength(2);
      expect(dto.adminUsers[0]).toBeInstanceOf(AdminUserResponseDto);
      expect(dto.adminUsers[0].cognitoSub).toBe('sub-admin1');
    });

    it('should handle empty admin users array', () => {
      expect.assertions(2);

      const plainObject = {
        adminUsers: [],
      };

      const dto = plainToClass(AdminUsersResponseDto, plainObject);

      expect(dto.adminUsers).toHaveLength(0);
      expect(dto.adminUsers).toStrictEqual([]);
    });
  });
});
