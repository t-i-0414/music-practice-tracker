import { UserResponseDto, toUserResponseDto, toUsersResponseDto } from '@/modules/aggregate/user/user.response.dto';
import { buildUserResponseDto } from '@/tests/factory/user.factory';

describe('user response DTOs', () => {
  describe('toUserResponseDto', () => {
    it('should transform user to UserResponseDto', () => {
      expect.assertions(7);

      const mockUser = buildUserResponseDto();
      const result = toUserResponseDto(mockUser);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.publicId).toBe(mockUser.publicId);
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
      expect(result.status).toBe(mockUser.status);
      expect(result.createdAt).toStrictEqual(mockUser.createdAt);
      expect(result.updatedAt).toStrictEqual(mockUser.updatedAt);
    });

    it('should exclude extra fields not in DTO', () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const userWithExtraFields = {
        ...mockUser,
        id: 1,
        internalField: 'should not appear',
      };

      const result = toUserResponseDto(userWithExtraFields);

      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('toUsersResponseDto', () => {
    it('should transform users array to UsersResponseDto', () => {
      expect.assertions(4);

      const mockUser = buildUserResponseDto();
      const mockUser2 = buildUserResponseDto();
      const users = [mockUser, mockUser2];
      const result = toUsersResponseDto(users);

      expect(result).toHaveProperty('users');
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toBeInstanceOf(UserResponseDto);
      expect(result.users[1]).toBeInstanceOf(UserResponseDto);
    });

    it('should handle empty array', () => {
      expect.assertions(2);

      const result = toUsersResponseDto([]);

      expect(result).toHaveProperty('users');
      expect(result.users).toHaveLength(0);
    });

    it('should transform each user correctly', () => {
      expect.assertions(3);

      const mockUser = buildUserResponseDto();
      const users = [mockUser, { ...mockUser, publicId: '223e4567-e89b-12d3-a456-426614174001', name: 'Another User' }];
      const result = toUsersResponseDto(users);

      expect(result.users[0].publicId).toBe(mockUser.publicId);
      expect(result.users[0].name).toBe(mockUser.name);
      expect(result.users[1].name).toBe('Another User');
    });
  });

  describe('dto class properties', () => {
    it('should have correct class name for UserResponseDto', () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const result = toUserResponseDto(mockUser);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.constructor.name).toBe('UserResponseDto');
    });

    it('should serialize dates correctly', () => {
      expect.assertions(2);

      const mockUser = buildUserResponseDto();
      const result = toUserResponseDto(mockUser);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});
