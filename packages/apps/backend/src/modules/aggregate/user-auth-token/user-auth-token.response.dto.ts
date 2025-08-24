import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';

import { UserAuthTokenType, UserAuthTokenRecord } from './user-auth-token.constants';
import { type UserAuthToken } from './user-auth-token.repository.service';

import { type Publicize } from '@/utils/publicize';

@Exclude()
export class UserAuthTokenResponseDto implements Publicize<UserAuthToken> {
  @ApiProperty({
    description: 'The auth token public ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  public publicId: string;

  @ApiProperty({
    description: 'The authentication token',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
  })
  @Expose()
  public token: string;

  @ApiProperty({
    description: 'The token type',
    example: UserAuthTokenRecord.REFRESH,
    enum: Object.values(UserAuthTokenRecord),
  })
  @Expose()
  public type: UserAuthTokenType;

  @ApiProperty({
    description: 'The user ID associated with this token',
    example: 1,
    type: Number,
  })
  @Expose()
  public userId: number;

  @ApiProperty({
    description: 'The token expiration timestamp',
    example: '2024-01-22T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @Expose()
  public expiresAt: Date;

  @ApiProperty({
    description: 'The token created at timestamp',
    example: '2024-01-15T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @Expose()
  public createdAt: Date;

  @ApiProperty({
    description: 'The token updated at timestamp',
    example: '2024-06-16T14:45:30.123Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @Expose()
  public updatedAt: Date;
}

export function toUserAuthTokenResponseDto(token: unknown): UserAuthTokenResponseDto {
  return plainToInstance(UserAuthTokenResponseDto, token);
}

export class UserAuthTokensResponseDto {
  @ApiProperty({ type: [UserAuthTokenResponseDto] })
  public tokens: UserAuthTokenResponseDto[];
}

export function toUserAuthTokensResponseDto(tokens: unknown[]): UserAuthTokensResponseDto {
  return {
    tokens: plainToInstance(UserAuthTokenResponseDto, tokens),
  };
}

export class AuthTokenResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  public accessToken: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
  })
  public refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
    type: Number,
  })
  public expiresIn: number;

  public constructor(data: { accessToken: string; refreshToken: string; expiresIn: number }) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.expiresIn = data.expiresIn;
  }
}
