import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FirebaseAuthVerifyTokenDto {
  @ApiProperty({
    description: 'Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0...',
  })
  @IsString()
  @IsNotEmpty()
  public idToken: string;
}

export class VerifiedTokenResponseDto {
  @ApiProperty({ description: 'Firebase UID', example: 'uid12345' })
  @IsString()
  @IsNotEmpty()
  public uid: string;

  @ApiProperty({
    description: 'Firebase email',
    example: 'user@example.com',
    required: false,
    format: 'email',
  })
  @IsString()
  @IsOptional()
  public email?: string;

  @ApiProperty({ description: 'Whether the Firebase email is verified', example: true })
  @IsBoolean()
  public emailVerified: boolean;

  @ApiProperty({ description: 'Sign-in provider', example: 'google.com', required: false })
  @IsString()
  @IsOptional()
  public signInProvider?: string;
}
