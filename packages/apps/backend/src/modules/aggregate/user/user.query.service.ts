import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindUserByIdDto, UserResponseDto } from './user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserQueryService {
  constructor(private repository: UserRepository) {}

  async findUserByIdOrFail(dto: FindUserByIdDto): Promise<UserResponseDto> {
    const user = await this.repository.findUniqueActiveUser(dto);
    if (!user) throw new NotFoundException(`User ${dto.id} not found`);

    return plainToInstance(UserResponseDto, user);
  }
}
