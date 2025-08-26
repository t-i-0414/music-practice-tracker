import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

import {
  CreateAdminUserInputDto,
  CreateManyAdminUsersInputDto,
  FindAdminUserByIdInputDto,
  FindManyAdminUsersByIdInputDto,
  DeleteAdminUserByIdInputDto,
  DeleteManyAdminUsersInputDto,
  UpdateAdminUserInputDto,
  UpdateAdminUserDataInputDto,
} from '@/aggregates/admin-user/dto';
import { AdminRole, AdminStatus } from '@/generated/prisma';

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
      expect(errors[0].constraints).toHaveProperty('isUuid');
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

  describe('findAdminUserByIdInputDto', () => {
    it('should pass validation with valid UUID', async () => {
      expect.assertions(1);

      const dto = new FindAdminUserByIdInputDto();
      dto.publicId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid UUID', async () => {
      expect.assertions(2);

      const dto = new FindAdminUserByIdInputDto();
      dto.publicId = 'invalid-uuid';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with empty publicId', async () => {
      expect.assertions(2);

      const dto = new FindAdminUserByIdInputDto();
      dto.publicId = '';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('findManyAdminUsersByIdInputDto', () => {
    it('should pass validation with valid UUIDs array', async () => {
      expect.assertions(1);

      const dto = new FindManyAdminUsersByIdInputDto();
      dto.publicIds = ['123e4567-e89b-12d3-a456-426614174000', '789e1234-e89b-12d3-a456-426614174000'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty array', async () => {
      expect.assertions(2);

      const dto = new FindManyAdminUsersByIdInputDto();
      dto.publicIds = [];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('should fail validation with invalid UUIDs in array', async () => {
      expect.assertions(2);

      const dto = new FindManyAdminUsersByIdInputDto();
      dto.publicIds = ['invalid-uuid', '123e4567-e89b-12d3-a456-426614174000'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation without publicIds', async () => {
      expect.assertions(1);

      const dto = new FindManyAdminUsersByIdInputDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('createManyAdminUsersInputDto', () => {
    it('should pass validation with valid admin users array', async () => {
      expect.assertions(1);

      const dto = new CreateManyAdminUsersInputDto();
      const adminUser1 = new CreateAdminUserInputDto();
      adminUser1.email = 'admin1@example.com';
      adminUser1.name = 'Admin User 1';
      adminUser1.role = AdminRole.VIEWER;

      const adminUser2 = new CreateAdminUserInputDto();
      adminUser2.email = 'admin2@example.com';
      adminUser2.name = 'Admin User 2';
      adminUser2.role = AdminRole.EDITOR;

      dto.adminUsers = [adminUser1, adminUser2];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should transform plain object with @Type decorator', () => {
      expect.assertions(2);

      const plainData = {
        adminUsers: [
          {
            email: 'admin1@example.com',
            name: 'Admin User 1',
            role: AdminRole.VIEWER,
          },
          {
            email: 'admin2@example.com',
            name: 'Admin User 2',
            role: AdminRole.EDITOR,
          },
        ],
      };

      const dto = plainToInstance(CreateManyAdminUsersInputDto, plainData);

      expect(dto.adminUsers).toHaveLength(2);
      expect(dto.adminUsers[0]).toBeInstanceOf(CreateAdminUserInputDto);
    });

    it('should fail validation with empty array', async () => {
      expect.assertions(2);

      const dto = new CreateManyAdminUsersInputDto();
      dto.adminUsers = [];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('should fail validation with invalid nested admin user data', async () => {
      expect.assertions(3);

      const dto = new CreateManyAdminUsersInputDto();
      const invalidAdminUser = new CreateAdminUserInputDto();
      invalidAdminUser.email = 'invalid-email';
      invalidAdminUser.name = 'Admin User';

      dto.adminUsers = [invalidAdminUser];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].children).toBeDefined();

      const nestedErrors = errors[0].children?.[0]?.children?.[0];

      expect(nestedErrors?.constraints).toHaveProperty('isEmail');
    });

    it('should validate nested objects properly', async () => {
      expect.assertions(4);

      const dto = new CreateManyAdminUsersInputDto();
      const adminUser1 = new CreateAdminUserInputDto();
      adminUser1.email = '';
      adminUser1.name = '';

      dto.adminUsers = [adminUser1];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].children).toBeDefined();

      // Check that nested validation errors are present
      expect(errors[0].children?.[0]?.children).toBeDefined();
      expect(errors[0].children?.[0]?.children?.length).toBeGreaterThan(0);
    });
  });

  describe('deleteAdminUserByIdInputDto', () => {
    it('should pass validation with valid UUID', async () => {
      expect.assertions(1);

      const dto = new DeleteAdminUserByIdInputDto();
      dto.publicId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid UUID', async () => {
      expect.assertions(2);

      const dto = new DeleteAdminUserByIdInputDto();
      dto.publicId = 'not-a-uuid';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with empty publicId', async () => {
      expect.assertions(2);

      const dto = new DeleteAdminUserByIdInputDto();
      dto.publicId = '';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('deleteManyAdminUsersInputDto', () => {
    it('should pass validation with valid UUIDs array', async () => {
      expect.assertions(1);

      const dto = new DeleteManyAdminUsersInputDto();
      dto.publicIds = ['123e4567-e89b-12d3-a456-426614174000', '789e1234-e89b-12d3-a456-426614174000'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty array', async () => {
      expect.assertions(2);

      const dto = new DeleteManyAdminUsersInputDto();
      dto.publicIds = [];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
    });

    it('should fail validation with invalid UUIDs', async () => {
      expect.assertions(2);

      const dto = new DeleteManyAdminUsersInputDto();
      dto.publicIds = ['not-a-uuid', 'also-not-a-uuid'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with mixed valid and invalid UUIDs', async () => {
      expect.assertions(2);

      const dto = new DeleteManyAdminUsersInputDto();
      dto.publicIds = ['123e4567-e89b-12d3-a456-426614174000', 'invalid-uuid'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });

  describe('updateAdminUserInputDto with @Type decorator', () => {
    it('should transform plain object with nested data using @Type decorator', () => {
      expect.assertions(3);

      const plainData = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          email: 'newemail@example.com',
          name: 'Updated Name',
          role: AdminRole.ADMIN,
        },
      };

      const dto = plainToInstance(UpdateAdminUserInputDto, plainData);

      expect(dto.publicId).toBe(plainData.publicId);
      expect(dto.data).toBeInstanceOf(UpdateAdminUserDataInputDto);
      expect(dto.data.email).toBe(plainData.data.email);
    });

    it('should validate transformed nested object', async () => {
      expect.assertions(1);

      const plainData = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          email: 'valid@example.com',
          name: 'Valid Name',
        },
      };

      const dto = plainToInstance(UpdateAdminUserInputDto, plainData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation on transformed object with invalid nested data', async () => {
      expect.assertions(3);

      const plainData = {
        publicId: '123e4567-e89b-12d3-a456-426614174000',
        data: {
          email: 'invalid-email',
        },
      };

      const dto = plainToInstance(UpdateAdminUserInputDto, plainData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].children).toBeDefined();

      const childConstraints = errors[0].children?.[0]?.constraints;

      expect(childConstraints).toHaveProperty('isEmail');
    });
  });
});
