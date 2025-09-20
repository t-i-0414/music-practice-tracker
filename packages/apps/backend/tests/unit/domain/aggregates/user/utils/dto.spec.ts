import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';

import {
  FindManyUsersByIdInputDto,
  toUserResponseDto,
  toUsersResponseDto,
  UserResponseDto,
} from '@/domain/aggregates/user/utils/dto';
import { UserFactory } from '@/tests/factory';

describe('unit user dto utilities', () => {
  describe('findManyUsersByIdInputDto', () => {
    it('transforms a comma separated string into array of ids', () => {
      const dto = plainToInstance(FindManyUsersByIdInputDto, { publicIds: 'a,b,c' });

      expect(dto.publicIds).toStrictEqual(['a', 'b', 'c']);
    });

    it('transforms strings into array of ids', () => {
      const dto = plainToInstance(FindManyUsersByIdInputDto, { publicIds: ['a', 'b', 'c'] });

      expect(dto.publicIds).toStrictEqual(['a', 'b', 'c']);
    });
  });

  describe('toUserResponseDto', () => {
    it('maps a Prisma user into UserResponseDto with Date instances', () => {
      const now = new Date('2025-01-01T12:00:00.000Z');
      const user = new UserFactory().build({ publicId: 'public-id', createdAt: now, updatedAt: now });
      const result = toUserResponseDto(user);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).not.toHaveProperty('id');
      expect(result.publicId).toBe('public-id');
      expect(result.firebaseUid).toBe(user.firebaseUid);
      expect(result.name).toBe(user.name);
      expect(result.status).toBe(user.status);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe(now.toISOString());
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.toISOString()).toBe(now.toISOString());
    });
  });

  describe('toUsersResponseDto', () => {
    it('maps an array of users to UsersResponseDto', () => {
      const now = new Date();
      const users = new UserFactory().buildMany(2, { createdAt: now, updatedAt: now });
      users[0].publicId = 'id-1';
      users[0].name = 'First User';
      users[0].firebaseUid = 'firebase-1';
      users[0].status = 'ACTIVE';
      users[1].publicId = 'id-2';
      users[1].name = 'Second User';
      users[1].firebaseUid = 'firebase-2';
      users[1].status = 'PENDING';
      const { users: dto } = toUsersResponseDto(users);

      expect(dto).toBeInstanceOf(Array);
      expect(dto).toHaveLength(2);

      const [result1] = dto;

      expect(result1).toBeInstanceOf(UserResponseDto);
      expect(result1).not.toHaveProperty('id');
      expect(result1.publicId).toBe('id-1');
      expect(result1.firebaseUid).toBe('firebase-1');
      expect(result1.name).toBe('First User');
      expect(result1.status).toBe('ACTIVE');
      expect(result1.createdAt).toBeInstanceOf(Date);
      expect(result1.createdAt.toISOString()).toBe(now.toISOString());
    });
  });
});
