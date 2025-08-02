import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';

import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH, UserStatusType, UserStatusRecord } from './user.constants';
import { User } from './user.repository.service';

import { Publicize } from '@/utils/publicize';

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
    description: 'The user status',
    example: UserStatusRecord.ACTIVE,
    enum: Object.values(UserStatusRecord),
  })
  @Expose()
  public status: UserStatusType;

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
