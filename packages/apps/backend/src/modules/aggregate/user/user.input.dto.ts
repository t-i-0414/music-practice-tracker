import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from './user.constants';

export class FindUserByIdInputDto {
  @ApiProperty({
    description: 'The user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  public id: string;
}

export class FindManyUsersByIdInputDto {
  @ApiProperty({
    description: 'List of user IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000', '789e1234-e89b-12d3-a456-426614174000'],
    isArray: true,
    type: String,
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayNotEmpty()
  public ids: string[];
}

export class CreateUserInputDto {
  @ApiProperty({
    description: 'The user email address',
    example: 'takuya.iwashiro@takudev.net',
    format: 'email',
    maxLength: MAX_EMAIL_LENGTH,
  })
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    description: 'The user name',
    example: 'Takuya Iwashiro',
    maxLength: MAX_NAME_LENGTH,
  })
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  @IsNotEmpty()
  public name: string;
}

export class CreateManyUsersInputDto {
  @ApiProperty({
    description: 'List of users to create',
    type: CreateUserInputDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserInputDto)
  @ArrayNotEmpty()
  public users: CreateUserInputDto[];
}

export class UpdateUserDataDto extends PartialType(CreateUserInputDto) {}

export class UpdateUserInputDto {
  @ApiProperty({
    description: 'The ID of the user to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @ApiProperty({
    description: 'Fields to update',
    type: UpdateUserDataDto,
  })
  @ValidateNested()
  @Type(() => UpdateUserDataDto)
  @IsNotEmpty()
  @IsNotEmptyObject()
  public data: UpdateUserDataDto;
}

export class DeleteUserByIdInputDto extends FindUserByIdInputDto {}

export class DeleteManyUsersInputDto extends FindManyUsersByIdInputDto {}

export class HardDeleteUserByIdInputDto extends FindUserByIdInputDto {}

export class HardDeleteManyUsersInputDto extends FindManyUsersByIdInputDto {}

export class RestoreUserByIdInputDto extends FindUserByIdInputDto {}

export class RestoreManyUsersInputDto extends FindManyUsersByIdInputDto {}
