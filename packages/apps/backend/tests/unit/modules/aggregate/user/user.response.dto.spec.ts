import 'reflect-metadata';

import { createUserEntity } from '../../../helpers';

import {
  ActiveUserResponseDto,
  ActiveUsersResponseDto,
  AnyUserResponseDto,
  AnyUsersResponseDto,
  DeletedUserResponseDto,
  DeletedUsersResponseDto,
  toActiveUserDto,
  toActiveUsersDto,
  toAnyUserDto,
  toAnyUsersDto,
  toDeletedUserDto,
  toDeletedUsersDto,
} from '@/modules/aggregate/user/user.response.dto';

describe('User Response DTOs', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2024-01-02T00:00:00.000Z');
  const mockDeletedDate = new Date('2024-01-03T00:00:00.000Z');

  const activeUserFixture = createUserEntity({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: mockDate,
    updatedAt: mockUpdatedDate,
    deletedAt: null,
  });

  const deletedUserFixture = createUserEntity({
    ...activeUserFixture,
    deletedAt: mockDeletedDate,
  });

  describe('toActiveUserDto', () => {
    it('should convert a user object to ActiveUserResponseDto', () => {
      const userWithExtraField = { ...activeUserFixture, extraField: 'should be excluded' };
      const result = toActiveUserDto(userWithExtraField);

      expect(result).toBeInstanceOf(ActiveUserResponseDto);
      expect(result.id).toBe(activeUserFixture.id);
      expect(result.name).toBe(activeUserFixture.name);
      expect(result.email).toBe(activeUserFixture.email);
      expect(result.createdAt).toEqual(activeUserFixture.createdAt);
      expect(result.updatedAt).toEqual(activeUserFixture.updatedAt);
      expect(result).not.toHaveProperty('deletedAt');
      expect(result).not.toHaveProperty('extraField');
    });

    it('should handle null input', () => {
      const result = toActiveUserDto(null);

      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      const result = toActiveUserDto(undefined);

      expect(result).toBeUndefined();
    });

    it('should handle date string inputs', () => {
      const userWithStringDates = {
        ...activeUserFixture,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      const result = toActiveUserDto(userWithStringDates);

      expect(result).toBeInstanceOf(ActiveUserResponseDto);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(result.updatedAt.toISOString()).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should exclude properties not in active user keys', () => {
      const userWithExtraFields = {
        ...activeUserFixture,
        password: 'secret',
        internalField: 'internal',
        deletedAt: mockDeletedDate,
      };

      const result = toActiveUserDto(userWithExtraFields);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('internalField');
      expect(result).not.toHaveProperty('deletedAt');
    });
  });

  describe('toActiveUsersDto', () => {
    it('should convert an array of users to ActiveUsersResponseDto', () => {
      const users = [activeUserFixture, { ...activeUserFixture, id: 'another-id' }];
      const result = toActiveUsersDto(users);

      expect(result).toBeInstanceOf(Object);
      expect(result.users).toBeInstanceOf(Array);
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toBeInstanceOf(ActiveUserResponseDto);
      expect(result.users[1]).toBeInstanceOf(ActiveUserResponseDto);
      expect(result.users[0].id).toBe(activeUserFixture.id);
      expect(result.users[1].id).toBe('another-id');
    });

    it('should handle empty array', () => {
      const result = toActiveUsersDto([]);

      expect(result).toBeInstanceOf(Object);
      expect(result.users).toBeInstanceOf(Array);
      expect(result.users).toHaveLength(0);
    });

    it('should handle array with null values', () => {
      const users = [activeUserFixture, null, undefined];
      const result = toActiveUsersDto(users);

      expect(result.users).toHaveLength(3);
      expect(result.users[0].id).toBe(activeUserFixture.id);
      expect(result.users[1]).toBeNull();
      expect(result.users[2]).toBeUndefined();
    });
  });

  describe('toDeletedUserDto', () => {
    it('should convert a deleted user object to DeletedUserResponseDto', () => {
      const result = toDeletedUserDto(deletedUserFixture);

      expect(result).toBeInstanceOf(DeletedUserResponseDto);
      expect(result.id).toBe(deletedUserFixture.id);
      expect(result.name).toBe(deletedUserFixture.name);
      expect(result.email).toBe(deletedUserFixture.email);
      expect(result.createdAt).toEqual(deletedUserFixture.createdAt);
      expect(result.updatedAt).toEqual(deletedUserFixture.updatedAt);
      expect(result.deletedAt).toEqual(deletedUserFixture.deletedAt);
      expect(result).not.toHaveProperty('extraField');
    });

    it('should handle user with null deletedAt', () => {
      const result = toDeletedUserDto(activeUserFixture);

      expect(result).toBeInstanceOf(DeletedUserResponseDto);
      expect(result.deletedAt).toBeNull();
    });

    it('should handle date string for deletedAt', () => {
      const userWithStringDate = {
        ...deletedUserFixture,
        deletedAt: '2024-01-03T00:00:00.000Z',
      };

      const result = toDeletedUserDto(userWithStringDate);

      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(result.deletedAt.toISOString()).toBe('2024-01-03T00:00:00.000Z');
    });

    it('should exclude extra properties', () => {
      const userWithExtraFields = {
        ...deletedUserFixture,
        password: 'secret',
        internalField: 'internal',
      };

      const result = toDeletedUserDto(userWithExtraFields);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('toDeletedUsersDto', () => {
    it('should convert an array of deleted users to DeletedUsersResponseDto', () => {
      const users = [deletedUserFixture, { ...deletedUserFixture, id: 'another-id' }];
      const result = toDeletedUsersDto(users);

      expect(result).toBeInstanceOf(Object);
      expect(result.users).toBeInstanceOf(Array);
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toBeInstanceOf(DeletedUserResponseDto);
      expect(result.users[1]).toBeInstanceOf(DeletedUserResponseDto);
      expect(result.users[0].deletedAt).toEqual(mockDeletedDate);
      expect(result.users[1].deletedAt).toEqual(mockDeletedDate);
    });

    it('should handle mixed active and deleted users', () => {
      const users = [activeUserFixture, deletedUserFixture];
      const result = toDeletedUsersDto(users);

      expect(result.users).toHaveLength(2);
      expect(result.users[0].deletedAt).toBeNull();
      expect(result.users[1].deletedAt).toEqual(mockDeletedDate);
    });

    it('should handle empty array', () => {
      const result = toDeletedUsersDto([]);

      expect(result.users).toBeInstanceOf(Array);
      expect(result.users).toHaveLength(0);
    });
  });

  describe('toAnyUserDto', () => {
    it('should convert any user object to AnyUserResponseDto', () => {
      const result = toAnyUserDto(deletedUserFixture);

      expect(result).toBeInstanceOf(AnyUserResponseDto);
      expect(result.id).toBe(deletedUserFixture.id);
      expect(result.name).toBe(deletedUserFixture.name);
      expect(result.email).toBe(deletedUserFixture.email);
      expect(result.createdAt).toEqual(deletedUserFixture.createdAt);
      expect(result.updatedAt).toEqual(deletedUserFixture.updatedAt);
      expect(result.deletedAt).toEqual(deletedUserFixture.deletedAt);
    });

    it('should handle active user (null deletedAt)', () => {
      const result = toAnyUserDto(activeUserFixture);

      expect(result).toBeInstanceOf(AnyUserResponseDto);
      expect(result.id).toBe(activeUserFixture.id);
      expect(result.deletedAt).toBeNull();
    });

    it('should handle null input', () => {
      const result = toAnyUserDto(null);

      expect(result).toBeNull();
    });

    it('should transform and expose only allowed properties', () => {
      const userWithExtraFields = {
        ...deletedUserFixture,
        password: 'secret',
        internalField: 'internal',
      };

      const result = toAnyUserDto(userWithExtraFields);

      expect(result.id).toBe(deletedUserFixture.id);
      expect(result.email).toBe(deletedUserFixture.email);
    });
  });

  describe('toAnyUsersDto', () => {
    it('should convert an array of any users to AnyUsersResponseDto', () => {
      const users = [activeUserFixture, deletedUserFixture];
      const result = toAnyUsersDto(users);

      expect(result).toBeInstanceOf(Object);
      expect(result.users).toBeInstanceOf(Array);
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toBeInstanceOf(AnyUserResponseDto);
      expect(result.users[1]).toBeInstanceOf(AnyUserResponseDto);
      expect(result.users[0].deletedAt).toBeNull();
      expect(result.users[1].deletedAt).toEqual(mockDeletedDate);
    });

    it('should handle empty array', () => {
      const result = toAnyUsersDto([]);

      expect(result.users).toBeInstanceOf(Array);
      expect(result.users).toHaveLength(0);
    });

    it('should handle array with various user states', () => {
      const users = [activeUserFixture, deletedUserFixture, null, undefined, { id: 'minimal-user' }];
      const result = toAnyUsersDto(users);

      expect(result.users).toHaveLength(5);
      expect(result.users[0].id).toBe(activeUserFixture.id);
      expect(result.users[1].id).toBe(deletedUserFixture.id);
      expect(result.users[2]).toBeNull();
      expect(result.users[3]).toBeUndefined();
      expect(result.users[4].id).toBe('minimal-user');
    });
  });

  describe('DTO Class Structure', () => {
    it('ActiveUserResponseDto should be a properly instantiated class', () => {
      const dto = new ActiveUserResponseDto();

      expect(dto).toBeDefined();
      expect(dto.constructor.name).toBe('ActiveUserResponseDto');
    });

    it('DeletedUserResponseDto should be a PickType with deletedAt', () => {
      const dto = new DeletedUserResponseDto();

      expect(dto).toHaveProperty('deletedAt');
      expect(dto.deletedAt).toBeUndefined();
    });

    it('AnyUserResponseDto should extend DeletedUserResponseDto', () => {
      const dto = new AnyUserResponseDto();

      expect(dto).toBeInstanceOf(DeletedUserResponseDto);
      expect(dto).toHaveProperty('deletedAt');
    });

    it('Response DTOs should have users array property', () => {
      const activeUsersDto = new ActiveUsersResponseDto();
      const deletedUsersDto = new DeletedUsersResponseDto();
      const anyUsersDto = new AnyUsersResponseDto();

      expect(activeUsersDto).toHaveProperty('users');
      expect(deletedUsersDto).toHaveProperty('users');
      expect(anyUsersDto).toHaveProperty('users');
    });
  });

  describe('Date transformation', () => {
    it('should properly transform ISO date strings to Date objects', () => {
      const userWithISODates = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        deletedAt: '2024-01-03T00:00:00.000Z',
      };

      const activeResult = toActiveUserDto(userWithISODates);
      expect(activeResult.createdAt).toBeInstanceOf(Date);
      expect(activeResult.updatedAt).toBeInstanceOf(Date);

      const deletedResult = toDeletedUserDto(userWithISODates);
      expect(deletedResult.createdAt).toBeInstanceOf(Date);
      expect(deletedResult.updatedAt).toBeInstanceOf(Date);
      expect(deletedResult.deletedAt).toBeInstanceOf(Date);
    });

    it('should handle invalid date strings', () => {
      const userWithInvalidDates = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: 'invalid-date',
        updatedAt: 'another-invalid-date',
        deletedAt: 'also-invalid',
      };

      const result = toDeletedUserDto(userWithInvalidDates);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toString()).toBe('Invalid Date');
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.toString()).toBe('Invalid Date');
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(result.deletedAt.toString()).toBe('Invalid Date');
    });
  });

  describe('Edge cases', () => {
    it('should handle deeply nested extra properties', () => {
      const userWithNestedProps = {
        ...activeUserFixture,
        nested: {
          deep: {
            property: 'should be excluded',
          },
        },
      };

      const result = toActiveUserDto(userWithNestedProps);
      expect(result).not.toHaveProperty('nested');
    });

    it('should handle array properties', () => {
      const userWithArrays = {
        ...activeUserFixture,
        roles: ['admin', 'user'],
        permissions: [{ name: 'read' }, { name: 'write' }],
      };

      const result = toActiveUserDto(userWithArrays);
      expect(result).not.toHaveProperty('roles');
      expect(result).not.toHaveProperty('permissions');
    });

    it('should handle numeric strings as IDs', () => {
      const userWithNumericId = {
        ...activeUserFixture,
        id: '12345',
      };

      const result = toActiveUserDto(userWithNumericId);
      expect(result.id).toBe('12345');
      expect(typeof result.id).toBe('string');
    });
  });

  describe('Transformation behavior', () => {
    it('should maintain data integrity during transformation', () => {
      const complexUser = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      };

      const activeDto = toActiveUserDto(complexUser);
      const deletedDto = toDeletedUserDto(complexUser);
      const anyDto = toAnyUserDto(complexUser);

      expect(activeDto.id).toBe(complexUser.id);
      expect(deletedDto.id).toBe(complexUser.id);
      expect(anyDto.id).toBe(complexUser.id);

      expect(activeDto.createdAt.getTime()).toBe(complexUser.createdAt.getTime());
      expect(deletedDto.createdAt.getTime()).toBe(complexUser.createdAt.getTime());
      expect(anyDto.createdAt.getTime()).toBe(complexUser.createdAt.getTime());
    });

    it('should handle empty objects', () => {
      const emptyObj = {};

      const activeResult = toActiveUserDto(emptyObj);
      const deletedResult = toDeletedUserDto(emptyObj);
      const anyResult = toAnyUserDto(emptyObj);

      expect(activeResult).toBeDefined();
      expect(deletedResult).toBeDefined();
      expect(anyResult).toBeDefined();

      expect(activeResult.id).toBeUndefined();
      expect(deletedResult.id).toBeUndefined();
      expect(anyResult.id).toBeUndefined();
    });
  });

  describe('Type coercion and validation', () => {
    it('should handle boolean values for dates', () => {
      const userWithBooleanDates = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: true,
        updatedAt: false,
        deletedAt: true,
      };

      const result = toDeletedUserDto(userWithBooleanDates);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it('should handle number values for string fields', () => {
      const userWithNumbers = {
        id: 12345,
        name: 67890,
        email: 11111,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      };

      const result = toActiveUserDto(userWithNumbers);

      expect(result.id).toBe(12345);
      expect(result.name).toBe(67890);
      expect(result.email).toBe(11111);
    });
  });
});
