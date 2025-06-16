import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from './user.constants';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(MAX_EMAIL_LENGTH)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  name: string;
}

export class FindUserByIdDto {
  @IsUUID()
  id: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  name?: string;
}

export class DeleteUserByIdDto {
  @IsUUID()
  id: string;
}
