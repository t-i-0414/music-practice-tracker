import { Injectable, Logger } from '@nestjs/common';

import { UserAggregate } from '@/domain/aggregates/user/user.aggregate';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';
import { Trace } from '@/utils/decorators/trace.decorator';

@Injectable()
export class DeleteUserService {
  private readonly logger = new Logger(DeleteUserService.name);

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

    try {
      await this.usersCommand.deleteUserById({ publicId });
    } catch (error: unknown) {
      this.logger.error(
        `INCONSISTENT STATE: Firebase account deleted but DB deletion failed (publicId=${publicId}, firebaseUid=${user.firebaseUid}). Manual reconciliation required.`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    aggregate.markAsDeleted();
    this.eventPublisher.publishAll(aggregate);
  }
}
