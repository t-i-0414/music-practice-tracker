import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';

import { DomainError } from '@/domain/utils/domain.error';
import {
  FindManyAdminUsersByIdInputDto,
  toAdminUserResponseDto,
  toAdminUsersResponseDto,
} from '@/domain/aggregates/admin-user/utils/dto';

jest.mock('@/utils/ensure-public-ids-to-array', () => ({
  ensurePublicIdsToArray: jest.fn((value: unknown) => {
    if (value === 'trigger-error') {
      throw new Error('failure');
    }
    if (typeof value === 'string') {
      return value.split(',');
    }
    return [];
  }),
}));

const mockedEnsure = jest.requireMock('@/utils/ensure-public-ids-to-array')
  .ensurePublicIdsToArray as jest.MockedFunction<(value: unknown) => string[]>;

describe('unit admin-user dto utilities', () => {
  beforeEach(() => {
    mockedEnsure.mockClear();
  });

  describe('FindManyAdminUsersByIdInputDto', () => {
    it('transforms comma separated string into array', () => {
      const dto = plainToInstance(FindManyAdminUsersByIdInputDto, { publicIds: 'x,y,z' });

      expect(dto.publicIds).toStrictEqual(['x', 'y', 'z']);
      expect(mockedEnsure).toHaveBeenCalledWith('x,y,z');
    });

    it('wraps ensurePublicIdsToArray errors with DomainError DO0004', () => {
      try {
        plainToInstance(FindManyAdminUsersByIdInputDto, { publicIds: 'trigger-error' });
        fail('Expected DomainError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        const domainError = error as DomainError;
        expect(domainError.errorCode).toBe('DO0004');
      }
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

      const dto = toAdminUserResponseDto(adminUser);

      expect(dto.publicId).toBe('admin-id');
      expect(dto.cognitoSub).toBe('sub');
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.createdAt.toISOString()).toBe(now.toISOString());
    });
  });

  describe('toAdminUsersResponseDto', () => {
    it('maps admin users list to response dto list', () => {
      const now = new Date();
      const users = [
        {
          id: 1,
          publicId: 'id-1',
          cognitoSub: 'sub-1',
          name: 'User 1',
          role: 'VIEWER',
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          publicId: 'id-2',
          cognitoSub: 'sub-2',
          name: 'User 2',
          role: 'ADMIN',
          status: 'SUSPENDED',
          createdAt: now,
          updatedAt: now,
        },
      ] as unknown as Parameters<typeof toAdminUsersResponseDto>[0];

      const dto = toAdminUsersResponseDto(users);

      expect(dto.adminUsers).toHaveLength(2);
      expect(dto.adminUsers[1].role).toBe('ADMIN');
    });
  });
});
