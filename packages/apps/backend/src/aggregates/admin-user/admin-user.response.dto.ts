import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';

import {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  AdminRoleType,
  AdminRoleRecord,
  AdminStatusType,
  AdminStatusRecord,
} from './admin-user.constants';
import { AdminUser } from './admin-user.repository.service';

import { Publicize } from '@/utils/publicize';

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
    description: 'The admin user email address',
    example: 'admin@example.com',
    format: 'email',
    maxLength: MAX_EMAIL_LENGTH,
  })
  @Expose()
  public email: string;

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
  public role: AdminRoleType;

  @ApiProperty({
    description: 'The admin user status',
    example: AdminStatusRecord.ACTIVE,
    enum: Object.values(AdminStatusRecord),
  })
  @Expose()
  public status: AdminStatusType;

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

export class AdminUsersResponseDto {
  @ApiProperty({
    description: 'The list of admin users',
    type: [AdminUserResponseDto],
  })
  @Type(() => AdminUserResponseDto)
  public adminUsers: AdminUserResponseDto[];
}

export function toAdminUserResponseDto(adminUser: AdminUser): AdminUserResponseDto {
  return plainToInstance(AdminUserResponseDto, adminUser, {
    excludeExtraneousValues: true,
  });
}

export function toAdminUsersResponseDto(adminUsers: AdminUser[]): AdminUsersResponseDto {
  return {
    adminUsers: adminUsers.map((adminUser) => toAdminUserResponseDto(adminUser)),
  };
}
