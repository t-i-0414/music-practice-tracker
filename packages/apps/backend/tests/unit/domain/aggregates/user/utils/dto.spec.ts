import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';

import { FindManyUsersByIdInputDto, toUserResponseDto, toUsersResponseDto } from '@/domain/aggregates/user/utils/dto';
import { DomainError } from '@/domain/utils/domain.error';

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

describe('unit user dto utilities', () => {
  beforeEach(() => {
    mockedEnsure.mockClear();
  });

  describe('FindManyUsersByIdInputDto', () => {
    it('transforms a comma separated string into array of ids', () => {
      const dto = plainToInstance(FindManyUsersByIdInputDto, { publicIds: 'a,b,c' });

      expect(dto.publicIds).toStrictEqual(['a', 'b', 'c']);
      expect(mockedEnsure).toHaveBeenCalledWith('a,b,c');
    });

    it('wraps transformation errors into DomainError DO0004', () => {
      try {
        plainToInstance(FindManyUsersByIdInputDto, { publicIds: 'trigger-error' });
        fail('Expected DomainError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        const domainError = error as DomainError;
        expect(domainError.errorCode).toBe('DO0004');
      }
    });
  });

  describe('toUserResponseDto', () => {
    it('maps a Prisma user into UserResponseDto with Date instances', () => {
      const now = new Date('2024-01-01T12:00:00.000Z');
      const user = {
        id: 1,
        publicId: 'public-id',
        firebaseUid: 'firebase-uid',
        name: 'User Name',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      } as unknown as Parameters<typeof toUserResponseDto>[0];

      const result = toUserResponseDto(user);

      expect(result).toBeInstanceOf(Object);
      expect(result.publicId).toBe('public-id');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe(now.toISOString());
    });
  });

  describe('toUsersResponseDto', () => {
    it('maps an array of users to UsersResponseDto', () => {
      const now = new Date();
      const users = [
        {
          id: 1,
          publicId: 'id-1',
          firebaseUid: 'firebase-1',
          name: 'First User',
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          publicId: 'id-2',
          firebaseUid: 'firebase-2',
          name: 'Second User',
          status: 'PENDING',
          createdAt: now,
          updatedAt: now,
        },
      ] as unknown as Parameters<typeof toUsersResponseDto>[0];

      const dto = toUsersResponseDto(users);

      expect(dto.users).toHaveLength(2);
      expect(dto.users[0].publicId).toBe('id-1');
      expect(dto.users[1].status).toBe('PENDING');
    });
  });
});
