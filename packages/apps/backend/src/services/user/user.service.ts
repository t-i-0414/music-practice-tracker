import { Injectable } from '@nestjs/common';
import { CreateUserDto, DeleteUserByIdDto, FindUserByIdDto, UpdateUserDto } from './user.dto';
import { UserEntity, UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {}

  async createUser(data: CreateUserDto): Promise<UserEntity> {
    return this.repository.createUser(data);
  }

  async findUserById({ id }: FindUserByIdDto): Promise<UserEntity | null> {
    return this.repository.findUser({ id });
  }

  async updateUserById(data: { findUserByIdDto: FindUserByIdDto; updateUserDto: UpdateUserDto }): Promise<UserEntity> {
    return this.repository.updateUser({
      where: { id: data.findUserByIdDto.id },
      data: {
        ...data.updateUserDto,
      },
    });
  }

  async deleteUserById({ id }: DeleteUserByIdDto): Promise<UserEntity> {
    return this.repository.deleteUser({ id });
  }
}
