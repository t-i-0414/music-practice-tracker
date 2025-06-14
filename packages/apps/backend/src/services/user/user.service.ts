import { Injectable } from '@nestjs/common';
import { UserEntity, UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {}

  async createUser(data: { email: string; name: string }): Promise<UserEntity> {
    return this.repository.createUser(data);
  }

  async findUserById(id: UserEntity['id']): Promise<UserEntity | null> {
    return this.repository.findUser({ id });
  }

  async updateUserById({
    id,
    data,
  }: {
    id: UserEntity['id'];
    data: Partial<Omit<UserEntity, 'id'>>;
  }): Promise<UserEntity> {
    return this.repository.updateUser({
      where: { id },
      data,
    });
  }

  async deleteUserById(id: UserEntity['id']): Promise<UserEntity> {
    return this.repository.deleteUser({ id });
  }
}
