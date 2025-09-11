import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Exclude, Expose, plainToInstance } from 'class-transformer';
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

import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH, UserStatusRecord, User } from './constants';

import { Publicize } from '@/domain/utils/publicize';

// ============================================
// Command DTOs (Input)
// ============================================

export class FindUserByIdInputDto {
  @ApiProperty({
    description: 'The user public ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  public publicId: string;
}

export class FindManyUsersByIdInputDto {
  @ApiProperty({
    description: 'List of user public IDs',
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

export class CreateUserInputDto {
  @ApiProperty({
    description: 'The user email address',
    example: 'takuya.iwashiro@takudev.net',
    format: 'email',
    maxLength: MAX_EMAIL_LENGTH,
  })
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    description: 'The user name',
    example: 'Takuya Iwashiro',
    maxLength: MAX_NAME_LENGTH,
  })
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  @IsNotEmpty()
  public name: string;

  @ApiProperty({
    description: 'Firebase UID',
    example: 'abc123def456',
    required: false,
  })
  @IsString()
  @IsOptional()
  public firebaseUid?: string;
}

export class CreateManyUsersInputDto {
  @ApiProperty({
    description: 'List of users to create',
    type: CreateUserInputDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserInputDto)
  @ArrayNotEmpty()
  public users: CreateUserInputDto[];
}

export class UpdateUserDataDto extends PartialType(CreateUserInputDto) {
  @ApiProperty({
    description: 'The user status',
    example: UserStatusRecord.ACTIVE,
    enum: Object.values(UserStatusRecord),
    required: false,
  })
  @IsOptional()
  @IsEnum(Object.values(UserStatusRecord))
  public status?: keyof typeof UserStatusRecord;
}

export class UpdateUserInputDto {
  @ApiProperty({
    description: 'The public ID of the user to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  public publicId: string;

  @ApiProperty({
    description: 'Fields to update',
    type: UpdateUserDataDto,
  })
  @ValidateNested()
  @Type(() => UpdateUserDataDto)
  @IsNotEmpty()
  @IsNotEmptyObject()
  public data: UpdateUserDataDto;
}

export class DeleteUserByIdInputDto extends FindUserByIdInputDto {}

export class DeleteManyUsersInputDto extends FindManyUsersByIdInputDto {}

// ============================================
// Query DTOs (Response)
// ============================================

@Exclude()
export class UserResponseDto implements Publicize<User> {
  @ApiProperty({
    description: 'The user public ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  public publicId: string;

  @ApiProperty({
    description: 'The user email address',
    example: 'takuya.iwashiro@takudev.net',
    format: 'email',
    maxLength: MAX_EMAIL_LENGTH,
  })
  @Expose()
  public email: string;

  @ApiProperty({
    description: 'The user name',
    example: 'Takuya Iwashiro',
    maxLength: MAX_NAME_LENGTH,
  })
  @Expose()
  public name: string;

  @ApiProperty({
    description: 'Firebase UID',
    example: 'abc123def456',
    required: false,
    nullable: true,
  })
  public firebaseUid: string | null;

  @ApiProperty({
    description: 'The user status',
    example: UserStatusRecord.ACTIVE,
    enum: Object.values(UserStatusRecord),
  })
  @Expose()
  public status: keyof typeof UserStatusRecord;

  @ApiProperty({
    description: 'The user created at timestamp',
    example: '2024-01-15T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @Expose()
  public createdAt: Date;

  @ApiProperty({
    description: 'The user updated at timestamp',
    example: '2024-06-16T14:45:30.123Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @Expose()
  public updatedAt: Date;
}

export function toUserResponseDto(user: unknown): UserResponseDto {
  return plainToInstance(UserResponseDto, user);
}

export class UsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  public users: UserResponseDto[];
}
export function toUsersResponseDto(users: unknown[]): UsersResponseDto {
  return {
    users: plainToInstance(UserResponseDto, users),
  };
}
