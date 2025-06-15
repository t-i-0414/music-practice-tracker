import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
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
  @IsInt()
  @Type(() => Number)
  id: number;
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
  @IsInt()
  @Type(() => Number)
  id: number;
}
