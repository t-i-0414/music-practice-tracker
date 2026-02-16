import { Injectable } from '@nestjs/common';

import { UserAggregate } from '@/domain/aggregates/user/user.aggregate';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';
import { Trace } from '@/utils/decorators/trace.decorator';

@Injectable()
export class DeleteUserService {
  public constructor(
    private readonly firebaseAuth: FirebaseAuthService,
    private readonly usersQuery: UserQueryService,
    private readonly usersCommand: UserCommandService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  @Trace()
  public async execute(publicId: string): Promise<void> {
    const user = await this.usersQuery.findUniqueOrThrowUserById({ publicId });

    const aggregate = UserAggregate.fromPersistence({
      publicId: user.publicId,
      name: user.name,
      firebaseUid: user.firebaseUid,
      status: user.status,
    });

    await this.firebaseAuth.deleteUser(user.firebaseUid);
    await this.usersCommand.deleteUserById({ publicId });

    aggregate.markAsDeleted();
    this.eventPublisher.publishAll(aggregate);
  }
}
