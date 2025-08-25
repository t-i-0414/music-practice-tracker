import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  AdminRoleRecord,
  AdminRoleType,
  AdminStatusRecord,
  AdminStatusType,
} from './admin-user.constants';

export class FindAdminUserByIdInputDto {
  @ApiProperty({
    description: 'The admin user public ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  public publicId: string;
}

export class FindManyAdminUsersByIdInputDto {
  @ApiProperty({
    description: 'List of admin user public IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000', '789e1234-e89b-12d3-a456-426614174000'],
    isArray: true,
    type: String,
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayNotEmpty()
  public publicIds: string[];
}

export class CreateAdminUserInputDto {
  @ApiProperty({
    description: 'The admin user email address',
    example: 'admin@example.com',
    format: 'email',
    maxLength: MAX_EMAIL_LENGTH,
  })
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    description: 'The admin user name',
    example: 'Admin User',
    maxLength: MAX_NAME_LENGTH,
  })
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  @IsNotEmpty()
  public name: string;

  @ApiProperty({
    description: 'The admin user role',
    example: AdminRoleRecord.VIEWER,
    enum: Object.values(AdminRoleRecord),
    required: false,
  })
  @IsEnum(AdminRoleRecord)
  @IsOptional()
  public role?: AdminRoleType;

  @ApiProperty({
    description: 'The admin user status',
    example: AdminStatusRecord.PENDING,
    enum: Object.values(AdminStatusRecord),
    required: false,
  })
  @IsEnum(AdminStatusRecord)
  @IsOptional()
  public status?: AdminStatusType;
}

export class CreateManyAdminUsersInputDto {
  @ApiProperty({
    description: 'Admin users to create',
    type: [CreateAdminUserInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdminUserInputDto)
  @ArrayNotEmpty()
  public adminUsers: CreateAdminUserInputDto[];
}

export class UpdateAdminUserDataInputDto {
  @ApiProperty({
    description: 'The admin user email address',
    example: 'admin@example.com',
    format: 'email',
    maxLength: MAX_EMAIL_LENGTH,
    required: false,
  })
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  @IsOptional()
  public email?: string;

  @ApiProperty({
    description: 'The admin user name',
    example: 'Admin User',
    maxLength: MAX_NAME_LENGTH,
    required: false,
  })
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  @IsOptional()
  public name?: string;

  @ApiProperty({
    description: 'The admin user role',
    example: AdminRoleRecord.ADMIN,
    enum: Object.values(AdminRoleRecord),
    required: false,
  })
  @IsEnum(AdminRoleRecord)
  @IsOptional()
  public role?: AdminRoleType;

  @ApiProperty({
    description: 'The admin user status',
    example: AdminStatusRecord.ACTIVE,
    enum: Object.values(AdminStatusRecord),
    required: false,
  })
  @IsEnum(AdminStatusRecord)
  @IsOptional()
  public status?: AdminStatusType;
}

export class UpdateAdminUserInputDto {
  @ApiProperty({
    description: 'The admin user public ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  public publicId: string;

  @ApiProperty({
    description: 'The admin user data to update',
    type: UpdateAdminUserDataInputDto,
  })
  @ValidateNested()
  @Type(() => UpdateAdminUserDataInputDto)
  @IsNotEmptyObject()
  public data: UpdateAdminUserDataInputDto;
}

export class DeleteAdminUserByIdInputDto {
  @ApiProperty({
    description: 'The admin user public ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  public publicId: string;
}

export class DeleteManyAdminUsersInputDto {
  @ApiProperty({
    description: 'List of admin user public IDs to delete',
    example: ['123e4567-e89b-12d3-a456-426614174000', '789e1234-e89b-12d3-a456-426614174000'],
    isArray: true,
    type: String,
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayNotEmpty()
  public publicIds: string[];
}
