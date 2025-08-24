import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';

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
