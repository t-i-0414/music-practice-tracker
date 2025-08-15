import { ValidationError, validate } from 'class-validator';

import { AdminRole, AdminStatus } from '@/generated/prisma';
import {
  CreateAdminUserInputDto,
  UpdateAdminUserInputDto,
  UpdateAdminUserDataInputDto,
} from '@/modules/aggregate/admin-user/admin-user.input.dto';

describe('adminUser Input DTOs', () => {
  describe('createAdminUserInputDto', () => {
    it('should pass validation with valid data', async () => {
      expect.assertions(1);

      const dto = new CreateAdminUserInputDto();
      dto.email = 'admin@example.com';
      dto.name = 'Admin User';
      dto.role = AdminRole.VIEWER;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid email', async () => {
      expect.assertions(2);

      const dto = new CreateAdminUserInputDto();
      dto.email = 'invalid-email';
      dto.name = 'Admin User';
      dto.role = AdminRole.VIEWER;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail validation with empty email', async () => {
      expect.assertions(2);

      const dto = new CreateAdminUserInputDto();
      dto.email = '';
      dto.name = 'Admin User';
      dto.role = AdminRole.VIEWER;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with empty name', async () => {
      expect.assertions(2);

      const dto = new CreateAdminUserInputDto();
      dto.email = 'admin@example.com';
      dto.name = '';
      dto.role = AdminRole.VIEWER;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should pass validation without role (optional)', async () => {
      expect.assertions(1);

      const dto = new CreateAdminUserInputDto();
      dto.email = 'admin@example.com';
      dto.name = 'Admin User';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid role', async () => {
      expect.assertions(2);

      const dto = new CreateAdminUserInputDto();
      dto.email = 'admin@example.com';
      dto.name = 'Admin User';
      dto.role = 'INVALID_ROLE' as AdminRole;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with missing required fields', async () => {
      expect.assertions(3);

      const dto = new CreateAdminUserInputDto();

      const errors = await validate(dto);

      expect(errors).toHaveLength(2);

      const errorProperties = errors.map((error: ValidationError) => error.property);

      expect(errorProperties).toContain('email');
      expect(errorProperties).toContain('name');
    });
  });

  describe('updateAdminUserDataInputDto', () => {
    it('should pass validation with all optional fields', async () => {
      expect.assertions(1);

      const dto = new UpdateAdminUserDataInputDto();
      dto.email = 'newemail@example.com';
      dto.name = 'Updated Name';
      dto.role = AdminRole.ADMIN;
      dto.status = AdminStatus.ACTIVE;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with partial fields', async () => {
      expect.assertions(1);

      const dto = new UpdateAdminUserDataInputDto();
      dto.name = 'Updated Name Only';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with no fields', async () => {
      expect.assertions(1);

      const dto = new UpdateAdminUserDataInputDto();

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid email', async () => {
      expect.assertions(2);

      const dto = new UpdateAdminUserDataInputDto();
      dto.email = 'invalid-email';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail validation with invalid role', async () => {
      expect.assertions(2);

      const dto = new UpdateAdminUserDataInputDto();
      dto.role = 'INVALID_ROLE' as AdminRole;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with invalid status', async () => {
      expect.assertions(2);

      const dto = new UpdateAdminUserDataInputDto();
      dto.status = 'INVALID_STATUS' as AdminStatus;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('updateAdminUserInputDto', () => {
    it('should pass validation with valid data', async () => {
      expect.assertions(1);

      const dto = new UpdateAdminUserInputDto();
      dto.publicId = '123e4567-e89b-12d3-a456-426614174000';
      dto.data = new UpdateAdminUserDataInputDto();
      dto.data.name = 'Updated Name';
      dto.data.role = AdminRole.ADMIN;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid UUID', async () => {
      expect.assertions(2);

      const dto = new UpdateAdminUserInputDto();
      dto.publicId = 'invalid-uuid';
      dto.data = new UpdateAdminUserDataInputDto();
      dto.data.name = 'Updated Name';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with empty publicId', async () => {
      expect.assertions(2);

      const dto = new UpdateAdminUserInputDto();
      dto.publicId = '';
      dto.data = new UpdateAdminUserDataInputDto();

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation without data', async () => {
      expect.assertions(1);

      const dto = new UpdateAdminUserInputDto();
      dto.publicId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with nested data validation', async () => {
      expect.assertions(1);

      const dto = new UpdateAdminUserInputDto();
      dto.publicId = '123e4567-e89b-12d3-a456-426614174000';
      dto.data = new UpdateAdminUserDataInputDto();
      dto.data.email = 'valid@email.com';
      dto.data.name = 'Valid Name';
      dto.data.role = AdminRole.EDITOR;
      dto.data.status = AdminStatus.ACTIVE;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
