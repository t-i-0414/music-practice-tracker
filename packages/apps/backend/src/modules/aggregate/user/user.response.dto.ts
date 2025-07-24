import { ApiProperty, PickType } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';

import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from './user.constants';
import { User } from './user.repository.service';

const activeUserKeys = ['id', 'email', 'name', 'createdAt', 'updatedAt'] satisfies (keyof User)[];

@Exclude()
class FullUserResponseDto implements User {
  @ApiProperty({
    description: 'The user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  public id: string;

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

  @ApiProperty({
    description: 'The user deleted at timestamp',
    example: '2024-07-20T10:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Type(() => Date)
  @Expose()
  public deletedAt: Date | null;
}

/**
 * User response DTO - Read-only fields returned from API
 */
@Exclude()
export class ActiveUserResponseDto extends PickType(FullUserResponseDto, activeUserKeys) {}
export function toActiveUserDto(user: unknown): ActiveUserResponseDto {
  return plainToInstance(ActiveUserResponseDto, user);
}

export class ActiveUsersResponseDto {
  @ApiProperty({ type: [ActiveUserResponseDto] })
  public users: ActiveUserResponseDto[];
}
export function toActiveUsersDto(users: unknown[]): ActiveUsersResponseDto {
  return {
    users: plainToInstance(ActiveUserResponseDto, users),
  };
}

/**
 * Deleted User response DTO - Read-only fields returned from API
 */
@Exclude()
export class DeletedUserResponseDto extends FullUserResponseDto {
  @ApiProperty({
    description: 'The user deleted at timestamp',
    example: '2024-07-20T10:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: false,
  })
  @Type(() => Date)
  @Expose()
  declare public deletedAt: Date;
}
export function toDeletedUserDto(user: unknown): DeletedUserResponseDto {
  return plainToInstance(DeletedUserResponseDto, user);
}

export class DeletedUsersResponseDto {
  @ApiProperty({ type: [DeletedUserResponseDto] })
  public users: DeletedUserResponseDto[];
}
export function toDeletedUsersDto(users: unknown[]): DeletedUsersResponseDto {
  return {
    users: plainToInstance(DeletedUserResponseDto, users),
  };
}

/**
 * Any User response DTO - Read-only fields returned from API
 */
export class AnyUserResponseDto extends FullUserResponseDto {}
export function toAnyUserDto(user: unknown): AnyUserResponseDto {
  return plainToInstance(AnyUserResponseDto, user);
}

export class AnyUsersResponseDto {
  @ApiProperty({ type: [AnyUserResponseDto] })
  public users: AnyUserResponseDto[];
}
export function toAnyUsersDto(users: unknown[]): AnyUsersResponseDto {
  return {
    users: plainToInstance(AnyUserResponseDto, users),
  };
}
