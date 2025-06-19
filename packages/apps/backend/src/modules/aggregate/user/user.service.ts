import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto, DeleteUserByIdDto, FindUserByIdDto, UpdateUserDto, UserResponseDto } from './user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {}

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    return plainToInstance(UserResponseDto, await this.repository.createUser(data));
  }

  async findUserByIdOrFail(dto: FindUserByIdDto): Promise<UserResponseDto> {
    const user = await this.repository.findUniqueActiveUser(dto);
    if (!user) throw new NotFoundException(`User ${dto.id} not found`);

    return plainToInstance(UserResponseDto, user);
  }

  async updateUserById(data: {
    findUserByIdDto: FindUserByIdDto;
    updateUserDto: UpdateUserDto;
  }): Promise<UserResponseDto> {
    await this.findUserByIdOrFail(data.findUserByIdDto);

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
