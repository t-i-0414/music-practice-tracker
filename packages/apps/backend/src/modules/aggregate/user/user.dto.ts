import { User } from '@/generated/prisma';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from './user.constants';

class UserBasicDto implements Partial<User> {
  @ApiProperty({
    description: 'The user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'The user email address',
    example: 'takuya.iwashiro@takudev.net',
    format: 'email',
    maxLength: MAX_EMAIL_LENGTH,
  })
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email: string;

  @ApiProperty({
    description: 'The user name',
    example: 'Takuya Iwashiro',
    maxLength: MAX_NAME_LENGTH,
  })
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  name: string;

  @ApiProperty({
    description: 'The user created at timestamp',
    example: '2024-01-15T09:30:00.000Z',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'The user updated at timestamp',
    example: '2024-06-16T14:45:30.123Z',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

/**
 * User response DTO - Read-only fields returned from API
 */

@Exclude()
export class UserResponseDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() name: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}

export class CreateUserDto extends PickType(UserBasicDto, ['email', 'name'] as const) {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  name: string;
}

export class FindUserByIdDto extends PickType(UserBasicDto, ['id'] as const) {
  @IsNotEmpty()
  id: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class DeleteUserByIdDto extends FindUserByIdDto {}
