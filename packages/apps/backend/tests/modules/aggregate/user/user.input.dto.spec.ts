import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

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

describe('user.input.dto.ts', () => {
  describe('CreateUserInputDto', () => {
    it('is valid with correct email and name', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: 'user@example.com',
        name: 'John Doe',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('is invalid with empty fields', async () => {
      const dto = plainToInstance(CreateUserInputDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('is invalid with malformed email', async () => {
      const dto = plainToInstance(CreateUserInputDto, {
        email: 'invalid-email',
        name: 'Valid Name',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('CreateManyUsersInputDto', () => {
    it('is valid with an array of valid users', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, {
        users: [
          { email: 'a@example.com', name: 'Alice' },
          { email: 'b@example.com', name: 'Bob' },
        ],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('is invalid with empty array', async () => {
      const dto = plainToInstance(CreateManyUsersInputDto, { users: [] });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateUserInputDto', () => {
    it('is valid with UUID and data', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
        data: { name: 'Updated Name' },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('is invalid without data', async () => {
      const dto = plainToInstance(UpdateUserInputDto, {
        id: validUUID,
        data: {},
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateUserDataDto', () => {
    it('accepts partial data', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        name: 'Updated',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('is invalid if empty string', async () => {
      const dto = plainToInstance(UpdateUserDataDto, {
        name: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  const singleIdDtos = [
    { name: 'FindUserByIdInputDto', dto: FindUserByIdInputDto },
    { name: 'DeleteUserByIdInputDto', dto: DeleteUserByIdInputDto },
    { name: 'HardDeleteUserByIdInputDto', dto: HardDeleteUserByIdInputDto },
    { name: 'RestoreUserByIdInputDto', dto: RestoreUserByIdInputDto },
  ];

  singleIdDtos.forEach(({ name, dto }) => {
    describe(name, () => {
      it('is valid with correct UUID', async () => {
        const input = plainToInstance(dto, { id: validUUID });
        const errors = await validate(input);
        expect(errors).toHaveLength(0);
      });

      it('is invalid without id', async () => {
        const input = plainToInstance(dto, {});
        const errors = await validate(input);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  const multiIdDtos = [
    { name: 'FindManyUsersByIdInputDto', dto: FindManyUsersByIdInputDto },
    { name: 'DeleteManyUsersInputDto', dto: DeleteManyUsersInputDto },
    { name: 'HardDeleteManyUsersInputDto', dto: HardDeleteManyUsersInputDto },
    { name: 'RestoreManyUsersInputDto', dto: RestoreManyUsersInputDto },
  ];

  multiIdDtos.forEach(({ name, dto }) => {
    describe(name, () => {
      it('is valid with UUID array', async () => {
        const input = plainToInstance(dto, {
          ids: [validUUID, validUUID],
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(0);
      });

      it('is invalid with empty array', async () => {
        const input = plainToInstance(dto, { ids: [] });
        const errors = await validate(input);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('is invalid with invalid UUID', async () => {
        const input = plainToInstance(dto, {
          ids: ['invalid-uuid'],
        });
        const errors = await validate(input);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });
});
