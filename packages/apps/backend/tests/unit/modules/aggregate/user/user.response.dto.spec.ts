import {
  ActiveUserResponseDto,
  DeletedUserResponseDto,
  AnyUserResponseDto,
  toActiveUserDto,
  toActiveUsersDto,
  toDeletedUserDto,
  toDeletedUsersDto,
  toAnyUserDto,
  toAnyUsersDto,
} from '@/modules/aggregate/user/user.response.dto';

describe('user response DTOs', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockDeletedUser = {
    ...mockUser,
    deletedAt: new Date('2024-01-02'),
  };

  describe('toActiveUserDto', () => {
    it('should transform user to ActiveUserResponseDto', () => {
      expect.assertions(6);

      const result = toActiveUserDto(mockUser);

      expect(result).toBeInstanceOf(ActiveUserResponseDto);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
      expect(result.createdAt).toStrictEqual(mockUser.createdAt);
      expect(result.updatedAt).toStrictEqual(mockUser.updatedAt);
    });

    it('should exclude deletedAt field', () => {
      expect.assertions(2);

      const result = toActiveUserDto(mockDeletedUser);

      expect(result).toBeInstanceOf(ActiveUserResponseDto);
      expect(result).not.toHaveProperty('deletedAt');
    });

    it('should handle null/undefined input', () => {
      expect.assertions(1);

      const result = toActiveUserDto(null);

      expect(result).toBeNull();
    });
  });

  describe('toActiveUsersDto', () => {
    it('should transform users array to ActiveUsersResponseDto', () => {
      expect.assertions(4);

      const users = [mockUser, { ...mockUser, id: '223e4567-e89b-12d3-a456-426614174001' }];
      const result = toActiveUsersDto(users);

      expect(result).toHaveProperty('users');
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toBeInstanceOf(ActiveUserResponseDto);
      expect(result.users[1]).toBeInstanceOf(ActiveUserResponseDto);
    });

    it('should handle empty array', () => {
      expect.assertions(2);

      const result = toActiveUsersDto([]);

      expect(result).toHaveProperty('users');
      expect(result.users).toHaveLength(0);
    });
  });

  describe('toDeletedUserDto', () => {
    it('should transform deleted user to DeletedUserResponseDto', () => {
      expect.assertions(7);

      const result = toDeletedUserDto(mockDeletedUser);

      expect(result).toBeInstanceOf(DeletedUserResponseDto);
      expect(result.id).toBe(mockDeletedUser.id);
      expect(result.email).toBe(mockDeletedUser.email);
      expect(result.name).toBe(mockDeletedUser.name);
      expect(result.createdAt).toStrictEqual(mockDeletedUser.createdAt);
      expect(result.updatedAt).toStrictEqual(mockDeletedUser.updatedAt);
      expect(result.deletedAt).toStrictEqual(mockDeletedUser.deletedAt);
    });

    it('should include all fields including deletedAt', () => {
      expect.assertions(2);

      const result = toDeletedUserDto(mockDeletedUser);

      expect(result).toBeInstanceOf(DeletedUserResponseDto);
      expect(result).toHaveProperty('deletedAt');
    });
  });

  describe('toDeletedUsersDto', () => {
    it('should transform deleted users array to DeletedUsersResponseDto', () => {
      expect.assertions(4);

      const users = [mockDeletedUser, { ...mockDeletedUser, id: '323e4567-e89b-12d3-a456-426614174002' }];
      const result = toDeletedUsersDto(users);

      expect(result).toHaveProperty('users');
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toBeInstanceOf(DeletedUserResponseDto);
      expect(result.users[1]).toBeInstanceOf(DeletedUserResponseDto);
    });
  });

  describe('toAnyUserDto', () => {
    it('should transform any user to AnyUserResponseDto', () => {
      expect.assertions(7);

      const result = toAnyUserDto(mockUser);

      expect(result).toBeInstanceOf(AnyUserResponseDto);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
      expect(result.createdAt).toStrictEqual(mockUser.createdAt);
      expect(result.updatedAt).toStrictEqual(mockUser.updatedAt);
      expect(result.deletedAt).toBeNull();
    });

    it('should include deletedAt field for deleted users', () => {
      expect.assertions(2);

      const result = toAnyUserDto(mockDeletedUser);

      expect(result).toBeInstanceOf(AnyUserResponseDto);
      expect(result.deletedAt).toStrictEqual(mockDeletedUser.deletedAt);
    });
  });

  describe('toAnyUsersDto', () => {
    it('should transform mixed users array to AnyUsersResponseDto', () => {
      expect.assertions(5);

      const users = [mockUser, mockDeletedUser];
      const result = toAnyUsersDto(users);

      expect(result).toHaveProperty('users');
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toBeInstanceOf(AnyUserResponseDto);
      expect(result.users[1]).toBeInstanceOf(AnyUserResponseDto);
      expect(result.users[1].deletedAt).toStrictEqual(mockDeletedUser.deletedAt);
    });
  });

  describe('dTO class inheritance', () => {
    it('should transform with proper class instance for ActiveUserResponseDto', () => {
      expect.assertions(2);

      const result = toActiveUserDto(mockUser);

      expect(result).toBeInstanceOf(ActiveUserResponseDto);
      expect(result.constructor.name).toBe('ActiveUserResponseDto');
    });

    it('should transform with proper class instance for DeletedUserResponseDto', () => {
      expect.assertions(2);

      const result = toDeletedUserDto(mockDeletedUser);

      expect(result).toBeInstanceOf(DeletedUserResponseDto);
      expect(result.constructor.name).toBe('DeletedUserResponseDto');
    });

    it('should transform with proper class instance for AnyUserResponseDto', () => {
      expect.assertions(2);

      const result = toAnyUserDto(mockUser);

      expect(result).toBeInstanceOf(AnyUserResponseDto);
      expect(result.constructor.name).toBe('AnyUserResponseDto');
    });
  });
});
