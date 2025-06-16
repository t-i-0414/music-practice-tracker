import { Injectable } from '@nestjs/common';
import { CreateUserDto, DeleteUserByIdDto, FindUserByIdDto, UpdateUserDto, UserResponseDto } from './user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {}

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    return this.repository.createUser(data);
  }

  async findUserById({ id }: FindUserByIdDto): Promise<UserResponseDto | null> {
    return this.repository.findUser({ id });
  }

  async updateUserById(data: {
    findUserByIdDto: FindUserByIdDto;
    updateUserDto: UpdateUserDto;
  }): Promise<UserResponseDto> {
    return this.repository.updateUser({
      where: { id: data.findUserByIdDto.id },
      data: {
        ...data.updateUserDto,
      },
    });
  }

  async deleteUserById({ id }: DeleteUserByIdDto): Promise<void> {
    await this.repository.deleteUser({ id });
  }
}
