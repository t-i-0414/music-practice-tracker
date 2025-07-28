import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import {
  FindUserByIdInputDto,
  FindManyUsersByIdInputDto,
  CreateUserInputDto,
  CreateManyUsersInputDto,
  UpdateUserInputDto,
  DeleteUserByIdInputDto,
  DeleteManyUsersInputDto,
  HardDeleteUserByIdInputDto,
  HardDeleteManyUsersInputDto,
  RestoreUserByIdInputDto,
  RestoreManyUsersInputDto,
} from '@/modules/aggregate/user/user.input.dto';

describe('user input DTOs', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const invalidUUID = 'invalid-uuid';

  describe('findUserByIdInputDto', () => {
    it('should validate with valid UUID', () => {
      expect.assertions(1);

      const dto = plainToInstance(FindUserByIdInputDto, { publicId: validUUID });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid UUID', () => {
      expect.assertions(2);

      const dto = plainToInstance(FindUserByIdInputDto, { publicId: invalidUUID });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail with empty publicId', () => {
      expect.assertions(2);

      const dto = plainToInstance(FindUserByIdInputDto, { publicId: '' });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('findManyUsersByIdInputDto', () => {
    it('should validate with valid UUID array', () => {
      expect.assertions(1);

      const dto = plainToInstance(FindManyUsersByIdInputDto, { publicIds: [validUUID, validUUID] });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail with empty array', () => {
      expect.assertions(2);

      const dto = plainToInstance(FindManyUsersByIdInputDto, { publicIds: [] });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('should fail with invalid UUID in array', () => {
      expect.assertions(2);

      const dto = plainToInstance(FindManyUsersByIdInputDto, { publicIds: [validUUID, invalidUUID] });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail with non-array value', () => {
      expect.assertions(2);

      const dto = plainToInstance(FindManyUsersByIdInputDto, { publicIds: 'not-an-array' });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isArray');
    });
  });

  describe('createUserInputDto', () => {
    it('should validate with valid data', () => {
      expect.assertions(1);

      const dto = plainToInstance(CreateUserInputDto, {
        email: 'test@example.com',
        name: 'Test User',
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid email', () => {
      expect.assertions(2);

      const dto = plainToInstance(CreateUserInputDto, {
        email: 'invalid-email',
        name: 'Test User',
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail with empty email', () => {
      expect.assertions(2);

      const dto = plainToInstance(CreateUserInputDto, {
        email: '',
        name: 'Test User',
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with too long email', () => {
      expect.assertions(2);

      const dto = plainToInstance(CreateUserInputDto, {
        email: `${'a'.repeat(256)}@example.com`,
        name: 'Test User',
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail with empty name', () => {
      expect.assertions(2);

      const dto = plainToInstance(CreateUserInputDto, {
        email: 'test@example.com',
        name: '',
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with too long name', () => {
      expect.assertions(2);

      const dto = plainToInstance(CreateUserInputDto, {
        email: 'test@example.com',
        name: 'a'.repeat(51),
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail with non-string name', () => {
      expect.assertions(2);

      const dto = plainToInstance(CreateUserInputDto, {
        email: 'test@example.com',
        name: 123,
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('createManyUsersInputDto', () => {
    it('should validate with valid users array', () => {
      expect.assertions(1);

      const dto = plainToInstance(CreateManyUsersInputDto, {
        users: [
          { email: 'test1@example.com', name: 'Test User 1' },
          { email: 'test2@example.com', name: 'Test User 2' },
        ],
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail with empty array', () => {
      expect.assertions(2);

      const dto = plainToInstance(CreateManyUsersInputDto, { users: [] });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('should fail with invalid user in array', () => {
      expect.assertions(1);

      const dto = plainToInstance(CreateManyUsersInputDto, {
        users: [
          { email: 'test1@example.com', name: 'Test User 1' },
          { email: 'invalid-email', name: 'Test User 2' },
        ],
      });
      const errors = validateSync(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('updateUserInputDto', () => {
    it('should validate with valid data', () => {
      expect.assertions(1);

      const dto = plainToInstance(UpdateUserInputDto, {
        publicId: validUUID,
        data: { name: 'Updated Name' },
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', () => {
      expect.assertions(1);

      const dto = plainToInstance(UpdateUserInputDto, {
        publicId: validUUID,
        data: { email: 'new@example.com' },
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid UUID', () => {
      expect.assertions(2);

      const dto = plainToInstance(UpdateUserInputDto, {
        publicId: invalidUUID,
        data: { name: 'Updated Name' },
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail with empty data object', () => {
      expect.assertions(2);

      const dto = plainToInstance(UpdateUserInputDto, {
        publicId: validUUID,
        data: {},
      });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmptyObject');
    });

    it('should fail with invalid data in update', () => {
      expect.assertions(1);

      const dto = plainToInstance(UpdateUserInputDto, {
        publicId: validUUID,
        data: { email: 'invalid-email' },
      });
      const errors = validateSync(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('deleteUserByIdInputDto', () => {
    it('should validate with valid UUID', () => {
      expect.assertions(1);

      const dto = plainToInstance(DeleteUserByIdInputDto, { publicId: validUUID });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });

    it('should extend FindUserByIdInputDto validation', () => {
      expect.assertions(2);

      const dto = plainToInstance(DeleteUserByIdInputDto, { publicId: invalidUUID });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });

  describe('deleteManyUsersInputDto', () => {
    it('should validate with valid UUID array', () => {
      expect.assertions(1);

      const dto = plainToInstance(DeleteManyUsersInputDto, { publicIds: [validUUID] });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });

    it('should extend FindManyUsersByIdInputDto validation', () => {
      expect.assertions(2);

      const dto = plainToInstance(DeleteManyUsersInputDto, { publicIds: [] });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });
  });

  describe('hardDeleteUserByIdInputDto', () => {
    it('should validate with valid UUID', () => {
      expect.assertions(1);

      const dto = plainToInstance(HardDeleteUserByIdInputDto, { publicId: validUUID });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('hardDeleteManyUsersInputDto', () => {
    it('should validate with valid UUID array', () => {
      expect.assertions(1);

      const dto = plainToInstance(HardDeleteManyUsersInputDto, { publicIds: [validUUID] });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('restoreUserByIdInputDto', () => {
    it('should validate with valid UUID', () => {
      expect.assertions(1);

      const dto = plainToInstance(RestoreUserByIdInputDto, { publicId: validUUID });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('restoreManyUsersInputDto', () => {
    it('should validate with valid UUID array', () => {
      expect.assertions(1);

      const dto = plainToInstance(RestoreManyUsersInputDto, { publicIds: [validUUID] });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
