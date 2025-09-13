import { ApiProperty } from '@nestjs/swagger';
import { Type, Exclude, Expose, plainToInstance } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { MAX_NAME_LENGTH, AdminRoleRecord, AdminStatusRecord, AdminUser } from './constants';

import { Publicize } from '@/domain/utils/publicize';

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
    description: 'The admin user Cognito sub',
    example: 'cognito-sub-1234567890',
  })
  @IsString()
  @IsNotEmpty()
  public cognitoSub: string;

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
  public role?: keyof typeof AdminRoleRecord;

  @ApiProperty({
    description: 'The admin user status',
    example: AdminStatusRecord.PENDING,
    enum: Object.values(AdminStatusRecord),
    required: false,
  })
  @IsEnum(AdminStatusRecord)
  @IsOptional()
  public status?: keyof typeof AdminStatusRecord;
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

export class UpdateAdminUserInputData {
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
  public role?: keyof typeof AdminRoleRecord;

  @ApiProperty({
    description: 'The admin user status',
    example: AdminStatusRecord.ACTIVE,
    enum: Object.values(AdminStatusRecord),
    required: false,
  })
  @IsEnum(AdminStatusRecord)
  @IsOptional()
  public status?: keyof typeof AdminStatusRecord;
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
    type: UpdateAdminUserInputData,
  })
  @ValidateNested()
  @Type(() => UpdateAdminUserInputData)
  @IsNotEmptyObject()
  public data: UpdateAdminUserInputData;
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

@Exclude()
export class AdminUserResponseDto implements Publicize<AdminUser> {
  @ApiProperty({
    description: 'The admin user public ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  public publicId: string;

  @ApiProperty({
    type: String,
    description: 'The admin user Cognito sub',
    example: 'cognito-sub-1234567890',
  })
  @Expose()
  public cognitoSub: string;

  @ApiProperty({
    description: 'The admin user name',
    example: 'Admin User',
    maxLength: MAX_NAME_LENGTH,
  })
  @Expose()
  public name: string;

  @ApiProperty({
    description: 'The admin user role',
    example: AdminRoleRecord.ADMIN,
    enum: Object.values(AdminRoleRecord),
  })
  @Expose()
  public role: keyof typeof AdminRoleRecord;

  @ApiProperty({
    description: 'The admin user status',
    example: AdminStatusRecord.ACTIVE,
    enum: Object.values(AdminStatusRecord),
  })
  @Expose()
  public status: keyof typeof AdminStatusRecord;

  @ApiProperty({
    description: 'The admin user created at timestamp',
    example: '2024-01-15T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @Expose()
  public createdAt: Date;

  @ApiProperty({
    description: 'The admin user updated at timestamp',
    example: '2024-06-16T14:45:30.123Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @Expose()
  public updatedAt: Date;
}
export function toAdminUserResponseDto(adminUser: AdminUser): AdminUserResponseDto {
  return plainToInstance(AdminUserResponseDto, adminUser, {
    excludeExtraneousValues: true,
  });
}

export class AdminUsersResponseDto {
  @ApiProperty({
    description: 'The list of admin users',
    type: [AdminUserResponseDto],
  })
  @Type(() => AdminUserResponseDto)
  public adminUsers: AdminUserResponseDto[];
}
export function toAdminUsersResponseDto(adminUsers: AdminUser[]): AdminUsersResponseDto {
  return {
    adminUsers: plainToInstance(AdminUserResponseDto, adminUsers),
  };
}
