import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FirebaseAuthVerifyTokenDto {
  @ApiProperty({
    description: 'Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0...',
  })
  @IsString()
  @IsNotEmpty()
  public idToken!: string;

  @ApiPropertyOptional({
    description: 'User name (required when provisioning a new user)',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  public name?: string;
}

export class FirebaseAuthUserDto {
  @ApiProperty({
    description: 'User public ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  public publicId!: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  public name!: string;
}

export class FirebaseAuthUserResponseDto {
  @ApiProperty({
    description: 'Authenticated user information',
    type: FirebaseAuthUserDto,
  })
  public user!: FirebaseAuthUserDto;
}
