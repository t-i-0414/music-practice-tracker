import { Injectable } from '@nestjs/common';

import { UserAggregate } from '@/domain/aggregates/user/user.aggregate';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import type { UpdateUserDataDto, UserResponseDto } from '@/domain/aggregates/user/utils/dto';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { UserName } from '@/domain/utils/value-objects/user-name.vo';
import { UserStatus } from '@/domain/utils/value-objects/user-status.vo';
import { Trace } from '@/utils/decorators/trace.decorator';

@Injectable()
export class UpdateUserService {
  public constructor(
    private readonly usersQuery: UserQueryService,
    private readonly usersCommand: UserCommandService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  @Trace()
  public async execute(publicId: string, data: UpdateUserDataDto): Promise<UserResponseDto> {
    const user = await this.usersQuery.findUniqueOrThrowUserById({ publicId });

    const aggregate = UserAggregate.fromPersistence({
      publicId: user.publicId,
      name: user.name,
      firebaseUid: user.firebaseUid,
      status: user.status,
    });

    if (data.name !== undefined) {
      aggregate.changeName(UserName.create(data.name));
    }

    if (data.status !== undefined) {
      aggregate.changeStatus(UserStatus.create(data.status));
    }

    const result = await this.usersCommand.updateUserById({ publicId, data });

    this.eventPublisher.publishAll(aggregate);

    return result;
  }
}
