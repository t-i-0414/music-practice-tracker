import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateUserInputDto, UpdateUserDataDto } from '@/domain/aggregates/user/utils/dto';

describe('unit User DTOs', () => {
  describe('updateUserInputDto', () => {
    it('should transform and validate nested data object', async () => {
      expect.assertions(3);

      const plainObject = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          name: 'Updated User',
        },
      };

      const dto = plainToClass(UpdateUserInputDto, plainObject);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.publicId).toBe(plainObject.publicId);
      expect(dto.data).toMatchObject(plainObject.data);
    });

    it('should transform data with Type decorator', async () => {
      expect.assertions(3);

      const plainObject = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          name: 'Test User',
        },
      };

      const dto = plainToClass(UpdateUserInputDto, plainObject);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.data).toBeInstanceOf(UpdateUserDataDto);
      expect(dto.data.name).toBe('Test User');
    });

    it('should fail validation with invalid UUID', async () => {
      expect.assertions(2);

      const plainObject = {
        publicId: 'invalid-uuid',
        data: {
          name: 'Test User',
        },
      };

      const dto = plainToClass(UpdateUserInputDto, plainObject);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'publicId')).toBe(true);
    });

    it('should validate with partial data update', async () => {
      expect.assertions(2);

      const plainObject = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          name: 'Partial Update',
        },
      };

      const dto = plainToClass(UpdateUserInputDto, plainObject);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.data.name).toBe('Partial Update');
    });

    it('should fail validation without data', async () => {
      expect.assertions(2);

      const plainObject = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const dto = plainToClass(UpdateUserInputDto, plainObject);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'data')).toBe(true);
    });
  });

  describe('updateUserDataDto', () => {
    it('should validate optional fields', async () => {
      expect.assertions(2);

      const plainObject = {
        name: 'Optional Name',
      };

      const dto = plainToClass(UpdateUserDataDto, plainObject);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe('Optional Name');
    });

    it('should validate with only name field', async () => {
      expect.assertions(2);

      const plainObject = {
        name: 'New Name',
      };

      const dto = plainToClass(UpdateUserDataDto, plainObject);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe('New Name');
    });

    // email field removed from user model; validation now focuses on name/status
  });
});
