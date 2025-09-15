import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
  @ApiProperty({ description: 'Whether the Firebase email is verified', example: true })
  public emailVerified: boolean;

  @ApiProperty({ description: 'Sign-in provider', example: 'google.com', required: false })
  public signInProvider?: string;
}
