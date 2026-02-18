import { Injectable } from '@nestjs/common';

import { UserAggregate } from './user.aggregate';
import {
  CreateManyUsersInputDto,
  CreateUserInputDto,
  DeleteManyUsersInputDto,
  DeleteUserByIdInputDto,
  UpdateUserInputDto,
  toUserResponseDto,
  toUsersResponseDto,
  UserResponseDto,
  UsersResponseDto,
} from './utils/dto';

import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { RepositoryService } from '@/repository/repository.service';

@Injectable()
export class UserCommandService {
  public constructor(
    private readonly repository: RepositoryService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  public async createUser(dto: CreateUserInputDto): Promise<UserResponseDto> {
    const created = await this.repository.user.create({ data: dto });

    const aggregate = UserAggregate.fromPersistence({
      publicId: created.publicId,
      name: created.name,
      firebaseUid: created.firebaseUid,
      status: created.status,
    });
    aggregate.markAsCreated();
    this.eventPublisher.publishAll(aggregate);

    return toUserResponseDto(created);
  }

  public async createManyAndReturnUsers({ users }: CreateManyUsersInputDto): Promise<UsersResponseDto> {
    const created = await this.repository.user.createManyAndReturn({ data: users });

    for (const user of created) {
      const aggregate = UserAggregate.fromPersistence({
        publicId: user.publicId,
        name: user.name,
        firebaseUid: user.firebaseUid,
        status: user.status,
      });
      aggregate.markAsCreated();
      this.eventPublisher.publishAll(aggregate);
    }

    return toUsersResponseDto(created);
  }

  public async updateUserById({ publicId, data }: UpdateUserInputDto): Promise<UserResponseDto> {
    return toUserResponseDto(
      await this.repository.user.update({
        where: { publicId },
        data,
      }),
    );
  }

  public async deleteUserById({ publicId }: DeleteUserByIdInputDto): Promise<void> {
    await this.repository.user.delete({
      where: { publicId },
    });
  }

  public async deleteManyUsersById({ publicIds }: DeleteManyUsersInputDto): Promise<void> {
    await this.repository.user.deleteMany({
      where: { publicId: { in: publicIds } },
    });
  }
}
