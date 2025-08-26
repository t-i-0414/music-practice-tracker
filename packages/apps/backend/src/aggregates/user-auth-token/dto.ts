import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';

import { UserAuthTokenType, UserAuthTokenRecord } from './constants';
import { type UserAuthToken } from './query.service';

import { type Publicize } from '@/utils/publicize';

// ============================================
// Command DTOs (Input)
// ============================================

export class SignUpInputDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public name: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/u, {
    message: 'Password must contain uppercase, lowercase, number/special character',
  })
  public password: string;
}

export class SignInInputDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  public password: string;
}

export class RefreshTokenInputDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  @IsString()
  public refreshToken: string;
}

export class ChangePasswordInputDto {
  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  public currentPassword: string;

  @ApiProperty({ example: 'NewSecurePassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/u, {
    message: 'Password must contain uppercase, lowercase, number/special character',
  })
  public newPassword: string;
}

export enum OAuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export class OAuthSignInInputDto {
  @ApiProperty({ enum: OAuthProvider, example: OAuthProvider.GOOGLE })
  @IsEnum(OAuthProvider)
  public provider: 'google' | 'apple';

  @ApiProperty({ example: '1234567890' })
  @IsString()
  public providerId: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public name: string;
}

// ============================================
// Query DTOs (Response)
// ============================================

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
    description: 'The user public ID associated with this token',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @Expose()
  public userPublicId: string;

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
