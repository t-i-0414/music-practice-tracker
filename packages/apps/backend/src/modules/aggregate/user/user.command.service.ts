import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto, DeleteUserByIdDto, FindUserByIdDto, UpdateUserDto, UserResponseDto } from './user.dto';
import { UserQueryService } from './user.query.service';
import { UserRepository } from './user.repository';

@Injectable()
export class UserCommandService {
  constructor(
    private repository: UserRepository,
    private queryService: UserQueryService,
  ) {}

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    return plainToInstance(UserResponseDto, await this.repository.createUser(data));
  }

  async updateUserById(data: {
    findUserByIdDto: FindUserByIdDto;
    updateUserDto: UpdateUserDto;
  }): Promise<UserResponseDto> {
    await this.queryService.findUserByIdOrFail(data.findUserByIdDto);

    return plainToInstance(
      UserResponseDto,
      await this.repository.updateUser({
        where: { id: data.findUserByIdDto.id },
        data: {
          ...data.updateUserDto,
        },
      }),
    );
  }

  async deleteUserById({ id }: DeleteUserByIdDto): Promise<void> {
    await this.repository.deleteUser({ id });
  }
}
