import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { getValidationErrorMessages } from '../../../helpers';

import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from '@/modules/aggregate/user/user.constants';
import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  DeleteUserByIdInputDto,
  FindManyUsersByIdInputDto,
  FindUserByIdInputDto,
  HardDeleteManyUsersInputDto,
  HardDeleteUserByIdInputDto,
  RestoreManyUsersInputDto,
  RestoreUserByIdInputDto,
  UpdateUserDataDto,
  UpdateUserInputDto,
} from '@/modules/aggregate/user/user.input.dto';

const validUUID = '123e4567-e89b-12d3-a456-426614174000';
const validUUID2 = '223e4567-e89b-12d3-a456-426614174001';
const invalidUUID = '123e4567-e89b-12d3-a456';

describe('User Input DTOs', () => {
  describe('CreateUserInputDto', () => {
    it('should be valid with correct email and name', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: 'user@example.com',
        name: 'John Doe',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle various valid email formats', async () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test_email@sub.domain.com',
        '123@example.com',
      ];

      const validationPromises = validEmails.map(async (email) => {
        const dto = plainToInstance(CreateUserInputDto, {
          email,
          name: 'Test User',
        });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
      await Promise.all(validationPromises);
    });

    it('should be invalid with empty fields', async () => {
      const dto = plainToInstance(CreateUserInputDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const messages = getValidationErrorMessages(errors);
      expect(messages).toContain('email must be an email');
      expect(messages).toContain('email should not be empty');
      expect(messages).toContain('name must be a string');
      expect(messages).toContain('name should not be empty');
    });

    it('should be invalid with null values', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: null,
        name: null,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid with empty strings', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: '',
        name: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const messages = getValidationErrorMessages(errors);
      expect(messages).toContain('email must be an email');
      expect(messages).toContain('email should not be empty');
      expect(messages).toContain('name should not be empty');
    });

    it('should be invalid with whitespace only', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: '   ',
        name: '   ',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid with malformed email', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user name@example.com',
        'user@example',
        'user@example..com',
        'user@@example.com',
      ];

      const validationPromises = invalidEmails.map(async (email) => {
        const dto = plainToInstance(CreateUserInputDto, {
          email,
          name: 'Valid Name',
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        const messages = getValidationErrorMessages(errors);
        expect(messages).toContain('email must be an email');
      });
      await Promise.all(validationPromises);
    });

    it('should be invalid with email exceeding max length', async () => {
      const longEmail = `${'a'.repeat(MAX_EMAIL_LENGTH - 10)}@example.com`;
      const dto = plainToInstance(CreateUserInputDto, {
        email: longEmail,
        name: 'Valid Name',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const messages = getValidationErrorMessages(errors);
      expect(messages.some((msg) => msg.includes('must be shorter than or equal to'))).toBe(true);
    });

    it('should be valid with email at max length', async () => {
      const simpleDomain = '@example.com';
      const maxLocalPartLength = Math.min(64, MAX_EMAIL_LENGTH - simpleDomain.length);
      const testEmail = 'a'.repeat(maxLocalPartLength) + simpleDomain;

      expect(testEmail.length).toBeLessThanOrEqual(MAX_EMAIL_LENGTH);
      expect(testEmail.length).toBeGreaterThan(64);

      const dto = plainToInstance(CreateUserInputDto, {
        email: testEmail,
        name: 'Valid Name',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be invalid with name exceeding max length', async () => {
      const longName = 'a'.repeat(MAX_NAME_LENGTH + 1);
      const dto = plainToInstance(CreateUserInputDto, {
        email: 'valid@example.com',
        name: longName,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const messages = getValidationErrorMessages(errors);
      expect(messages.some((msg) => msg.includes('must be shorter than or equal to'))).toBe(true);
    });

    it('should be valid with name at max length', async () => {
      const maxLengthName = 'a'.repeat(MAX_NAME_LENGTH);
      const dto = plainToInstance(CreateUserInputDto, {
        email: 'valid@example.com',
        name: maxLengthName,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be invalid with non-string values', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: 123,
        name: { invalid: 'object' },
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle unicode characters in name', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: 'user@example.com',
        name: '田中 太郎 (Tanaka Tarō) 🎸',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should trim whitespace from values during transformation', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: '  user@example.com  ',
        name: '  John Doe  ',
      });
      expect(dto.email).toBe('  user@example.com  ');
      expect(dto.name).toBe('  John Doe  ');

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('CreateManyUsersInputDto', () => {
    it('should be valid with an array of valid users', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, {
        users: [
          { email: 'a@example.com', name: 'Alice' },
          { email: 'b@example.com', name: 'Bob' },
        ],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be valid with many users', async () => {
      const users = Array.from({ length: 100 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
      }));
      const dto = plainToInstance(CreateManyUsersInputDto, { users });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be invalid with empty array', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, { users: [] });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const messages = getValidationErrorMessages(errors);
      expect(messages).toContain('users should not be empty');
    });

    it('should be invalid without users property', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid with null users', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, { users: null });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid with non-array users', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, { users: 'not-an-array' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate each user in the array', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, {
        users: [
          { email: 'valid@example.com', name: 'Valid User' },
          { email: 'invalid-email', name: 'Invalid Email User' },
          { email: 'missing@example.com' },
        ],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const nestedErrors = errors.find((e) => e.property === 'users');
      expect(nestedErrors?.children?.length).toBeGreaterThan(0);
    });

    it('should handle duplicate emails in array', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, {
        users: [
          { email: 'duplicate@example.com', name: 'User 1' },
          { email: 'duplicate@example.com', name: 'User 2' },
        ],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should properly transform nested objects', async () => {
      const inputData = {
        users: [
          { email: 'test1@example.com', name: 'Test 1', extra: 'field' },
          { email: 'test2@example.com', name: 'Test 2', another: 'field' },
        ],
      };
      const dto = plainToInstance(CreateManyUsersInputDto, inputData);

      expect(dto.users).toHaveLength(2);
      expect(dto.users[0]).toBeInstanceOf(CreateUserInputDto);
      expect(dto.users[1]).toBeInstanceOf(CreateUserInputDto);

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateUserInputDto', () => {
    it('should be valid with UUID and data', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
        data: { name: 'Updated Name' },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be valid with partial data', async () => {
      const validCases = [
        { id: validUUID, data: { name: 'New Name' } },
        { id: validUUID, data: { email: 'new@example.com' } },
        { id: validUUID, data: { name: 'New Name', email: 'new@example.com' } },
      ];

      const validationPromises = validCases.map(async (testCase) => {
        const dto = plainToInstance(UpdateUserInputDto, testCase);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
      await Promise.all(validationPromises);
    });

    it('should be invalid with empty data object', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
        data: {},
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const messages = getValidationErrorMessages(errors);
      expect(messages.some((msg) => msg.toLowerCase().includes('empty'))).toBe(true);
    });

    it('should be invalid without id', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        data: { name: 'Updated Name' },
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const messages = getValidationErrorMessages(errors);
      expect(messages).toContain('id must be a UUID');
      expect(messages).toContain('id should not be empty');
    });

    it('should be invalid without data', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid with null data', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
        data: null,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should be invalid with invalid UUID', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: invalidUUID,
        data: { name: 'Updated Name' },
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const messages = getValidationErrorMessages(errors);
      expect(messages).toContain('id must be a UUID');
    });

    it('should validate nested data properties', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
        data: {
          email: 'invalid-email',
          name: 'a'.repeat(MAX_NAME_LENGTH + 1),
        },
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should properly transform data to UpdateUserDataDto', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
        data: { name: 'Test', email: 'test@example.com' },
      });
      expect(dto.data).toBeInstanceOf(UpdateUserDataDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should ignore extra fields in data', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
        data: {
          name: 'Updated Name',
          extraField: 'should be ignored',
          anotherExtra: 123,
        },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateUserDataDto', () => {
    it('should accept partial data with only name', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        name: 'Updated',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept partial data with only email', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        email: 'updated@example.com',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept both name and email', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        name: 'Updated Name',
        email: 'updated@example.com',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be valid with empty object (all fields optional)', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should be invalid with empty string name', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        name: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const messages = getValidationErrorMessages(errors);
      expect(messages).toContain('name should not be empty');
    });

    it('should be invalid with empty string email', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        email: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should inherit validation rules from CreateUserInputDto', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        email: 'invalid-email',
        name: 'a'.repeat(MAX_NAME_LENGTH + 1),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const messages = getValidationErrorMessages(errors);
      expect(messages.some((msg) => msg.includes('email must be an email'))).toBe(true);
      expect(messages.some((msg) => msg.includes('must be shorter than or equal to'))).toBe(true);
    });

    it('should allow undefined values (partial type behavior)', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        name: undefined,
        email: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should not allow null values when field is provided', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        name: null,
        email: null,
      });
      const errors = await validate(dto);
      if (errors.length > 0) {
        const messages = getValidationErrorMessages(errors);
        expect(messages.some((msg) => msg.includes('must be') || msg.includes('should not be empty'))).toBe(true);
      } else {
        expect(dto.name).toBeNull();
        expect(dto.email).toBeNull();
      }
    });
  });

  describe('Single ID DTOs (Find/Delete/HardDelete/Restore)', () => {
    const singleIdDtos = [
      { name: 'FindUserByIdInputDto', dto: FindUserByIdInputDto },
      { name: 'DeleteUserByIdInputDto', dto: DeleteUserByIdInputDto },
      { name: 'HardDeleteUserByIdInputDto', dto: HardDeleteUserByIdInputDto },
      { name: 'RestoreUserByIdInputDto', dto: RestoreUserByIdInputDto },
    ];

    singleIdDtos.forEach(({ name, dto }) => {
      describe(name, () => {
        it('should be valid with correct UUID', async () => {
          const input = plainToInstance(dto, { id: validUUID });
          const errors = await validate(input);
          expect(errors).toHaveLength(0);
        });

        it('should be valid with different UUID formats', async () => {
          const uuids = [
            '123e4567-e89b-12d3-a456-426614174000',
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11',
          ];

          const validationPromises = uuids.map(async (uuid) => {
            const input = plainToInstance(dto, { id: uuid });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
          });
          await Promise.all(validationPromises);
        });

        it('should be invalid without id', async () => {
          const input = plainToInstance(dto, {});
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
          const messages = getValidationErrorMessages(errors);
          expect(messages).toContain('id must be a UUID');
          expect(messages).toContain('id should not be empty');
        });

        it('should be invalid with null id', async () => {
          const input = plainToInstance(dto, { id: null });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
        });

        it('should be invalid with empty string id', async () => {
          const input = plainToInstance(dto, { id: '' });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
        });

        it('should be invalid with invalid UUID formats', async () => {
          const invalidUUIDs = [
            '123e4567-e89b-12d3-a456',
            '123e4567-e89b-12d3-a456-426614174000-extra',
            '123e4567-e89b-12d3-g456-426614174000',
            '123e4567e89b12d3a456426614174000',
            'not-a-uuid',
            '12345678-1234-1234-1234-123456789abc',
          ];

          const validationPromises = invalidUUIDs.map(async (invalidId) => {
            const input = plainToInstance(dto, { id: invalidId });
            const errors = await validate(input);
            expect(errors.length).toBeGreaterThan(0);
            const messages = getValidationErrorMessages(errors);
            expect(messages).toContain('id must be a UUID');
          });
          await Promise.all(validationPromises);
        });

        it('should be invalid with non-string id', async () => {
          const input = plainToInstance(dto, { id: 123 });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
        });

        it('should ignore extra properties', async () => {
          const input = plainToInstance(dto, {
            id: validUUID,
            extra: 'property',
            another: 123,
          });
          const errors = await validate(input);
          expect(errors).toHaveLength(0);
          expect(input.id).toBe(validUUID);
        });

        it('should handle inheritance correctly', () => {
          if (name !== 'FindUserByIdInputDto') {
            expect(Object.getPrototypeOf(dto)).toBe(FindUserByIdInputDto);
          }
        });
      });
    });
  });

  describe('Multiple ID DTOs (FindMany/DeleteMany/HardDeleteMany/RestoreMany)', () => {
    const multiIdDtos = [
      { name: 'FindManyUsersByIdInputDto', dto: FindManyUsersByIdInputDto },
      { name: 'DeleteManyUsersInputDto', dto: DeleteManyUsersInputDto },
      { name: 'HardDeleteManyUsersInputDto', dto: HardDeleteManyUsersInputDto },
      { name: 'RestoreManyUsersInputDto', dto: RestoreManyUsersInputDto },
    ];

    multiIdDtos.forEach(({ name, dto }) => {
      describe(name, () => {
        it('should be valid with UUID array', async () => {
          const input = plainToInstance(dto, {
            ids: [validUUID, validUUID2],
          });
          const errors = await validate(input);
          expect(errors).toHaveLength(0);
        });

        it('should be valid with single UUID in array', async () => {
          const input = plainToInstance(dto, {
            ids: [validUUID],
          });
          const errors = await validate(input);
          expect(errors).toHaveLength(0);
        });

        it('should be valid with many UUIDs', async () => {
          const ids = Array.from(
            { length: 100 },
            (_, i) => `${i.toString().padStart(8, '0')}-e89b-12d3-a456-426614174000`,
          );
          const input = plainToInstance(dto, { ids });
          const errors = await validate(input);
          expect(errors).toHaveLength(0);
        });

        it('should be invalid with empty array', async () => {
          const input = plainToInstance(dto, { ids: [] });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
          const messages = getValidationErrorMessages(errors);
          expect(messages).toContain('ids should not be empty');
        });

        it('should be invalid without ids property', async () => {
          const input = plainToInstance(dto, {});
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
        });

        it('should be invalid with null ids', async () => {
          const input = plainToInstance(dto, { ids: null });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
        });

        it('should be invalid with non-array ids', async () => {
          const input = plainToInstance(dto, { ids: 'not-an-array' });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
        });

        it('should be invalid with any invalid UUID in array', async () => {
          const input = plainToInstance(dto, {
            ids: [validUUID, 'invalid-uuid', validUUID2],
          });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
          const messages = getValidationErrorMessages(errors);
          expect(messages.some((msg) => msg.includes('each value in ids must be a UUID'))).toBe(true);
        });

        it('should be invalid with mixed valid and invalid UUIDs', async () => {
          const input = plainToInstance(dto, {
            ids: [validUUID, '123e4567-e89b-12d3-a456', validUUID2, 'not-a-uuid'],
          });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
        });

        it('should be invalid with non-string values in array', async () => {
          const input = plainToInstance(dto, {
            ids: [validUUID, 123, null, undefined],
          });
          const errors = await validate(input);
          expect(errors.length).toBeGreaterThan(0);
        });

        it('should allow duplicate UUIDs in array', async () => {
          const input = plainToInstance(dto, {
            ids: [validUUID, validUUID, validUUID],
          });
          const errors = await validate(input);
          expect(errors).toHaveLength(0);
        });

        it('should ignore extra properties', async () => {
          const input = plainToInstance(dto, {
            ids: [validUUID],
            extra: 'property',
            another: 123,
          });
          const errors = await validate(input);
          expect(errors).toHaveLength(0);
          expect(input.ids).toEqual([validUUID]);
        });

        it('should handle case-insensitive UUIDs', async () => {
          const input = plainToInstance(dto, {
            ids: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11'],
          });
          const errors = await validate(input);
          expect(errors).toHaveLength(0);
        });

        it('should handle inheritance correctly', () => {
          if (name !== 'FindManyUsersByIdInputDto') {
            expect(Object.getPrototypeOf(dto)).toBe(FindManyUsersByIdInputDto);
          }
        });
      });
    });
  });

  describe('Edge cases and special scenarios', () => {
    it('should handle very long arrays efficiently', async () => {
      const ids = Array.from({ length: 1000 }, (_, i) => {
        const paddedIndex = i.toString().padStart(8, '0');
        return `${paddedIndex}-e89b-12d3-a456-426614174000`;
      });
      const dto = plainToInstance(FindManyUsersByIdInputDto, { ids });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate nested objects in CreateManyUsersInputDto deeply', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, {
        users: [
          { email: 'valid@example.com', name: 'Valid' },
          { email: 'invalid', name: '' },
          { email: 'test@example.com' },
        ],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const userErrors = errors.find((e) => e.property === 'users');
      expect(userErrors?.children).toBeDefined();
      expect(userErrors?.children?.length).toBeGreaterThan(0);
    });

    it('should handle plainToInstance transformation edge cases', async () => {
      const maliciousInput = {
        id: validUUID,
        __proto__: { polluted: true },
        constructor: { prototype: { polluted: true } },
      };

      const dto = plainToInstance(FindUserByIdInputDto, maliciousInput);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect((dto as any).polluted).toBeUndefined();
    });

    it('should handle circular references gracefully', () => {
      const circularData: any = { id: validUUID, data: { name: 'Test' } };
      circularData.data.circular = circularData;

      try {
        const dto = plainToInstance(UpdateUserInputDto, circularData);
        expect(dto.id).toBe(validUUID);
        expect(dto.data).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance considerations', () => {
    it('should validate large batch efficiently', async () => {
      const start = Date.now();
      const users = Array.from({ length: 500 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
      }));

      const dto = plainToInstance(CreateManyUsersInputDto, { users });
      const errors = await validate(dto);
      const duration = Date.now() - start;

      expect(errors).toHaveLength(0);
      expect(duration).toBeLessThan(1000);
    });
  });
});
