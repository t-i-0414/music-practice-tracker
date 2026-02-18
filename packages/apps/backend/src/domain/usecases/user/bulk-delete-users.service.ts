import { Injectable } from '@nestjs/common';

import { UserAggregate } from '@/domain/aggregates/user/user.aggregate';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { Trace } from '@/utils/decorators/trace.decorator';

@Injectable()
export class BulkDeleteUsersService {
  public constructor(
    private readonly usersQuery: UserQueryService,
    private readonly usersCommand: UserCommandService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  @Trace()
  public async execute(publicIds: string[]): Promise<void> {
    const { users } = await this.usersQuery.findManyUsersById({ publicIds });

    await this.usersCommand.deleteManyUsersById({ publicIds });

    for (const user of users) {
      const aggregate = UserAggregate.fromPersistence({
        publicId: user.publicId,
        name: user.name,
        firebaseUid: user.firebaseUid,
        status: user.status,
      });
      aggregate.markAsDeleted();
      this.eventPublisher.publishAll(aggregate);
    }
  }
}
