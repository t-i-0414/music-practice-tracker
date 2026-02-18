import { Injectable, Logger } from '@nestjs/common';

import { UserAggregate } from '@/domain/aggregates/user/user.aggregate';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';
import { Trace } from '@/utils/decorators/trace.decorator';

/**
 * Orchestrates bulk user deletion across Firebase and the database.
 *
 * For each matched user the service deletes the Firebase account first,
 * then removes the database record, and finally publishes a
 * {@link UserDeletedEvent} per entity through the domain event system.
 */
@Injectable()
export class BulkDeleteUsersService {
  private readonly logger = new Logger(BulkDeleteUsersService.name);

  public constructor(
    private readonly firebaseAuth: FirebaseAuthService,
    private readonly usersQuery: UserQueryService,
    private readonly usersCommand: UserCommandService,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  /**
   * Delete multiple users by their public IDs.
   *
   * 1. Query matching users from the database.
   * 2. Warn if some requested IDs did not match any record.
   * 3. Delete Firebase accounts in a single batch call.
   * 4. Delete database records.
   * 5. Publish {@link UserDeletedEvent} for each deleted user.
   *
   * If the database deletion fails after Firebase accounts have been
   * removed, the inconsistent state is logged and the error is re-thrown.
   */
  @Trace()
  public async execute(publicIds: string[]): Promise<void> {
    const EMPTY = 0;
    if (publicIds.length === EMPTY) return;

    const { users } = await this.usersQuery.findManyUsersById({ publicIds });

    if (users.length === EMPTY) {
      this.logger.warn(`No users found for any of the ${String(publicIds.length)} requested publicIds`);
      return;
    }

    if (users.length < publicIds.length) {
      this.logger.warn(
        `Only ${String(users.length)} of ${String(publicIds.length)} requested publicIds matched existing users`,
      );
    }

    const firebaseUids = users.map((u) => u.firebaseUid);
    await this.firebaseAuth.deleteUsers(firebaseUids);

    const matchedPublicIds = users.map((u) => u.publicId);

    try {
      await this.usersCommand.deleteManyUsersById({ publicIds: matchedPublicIds });
    } catch (error: unknown) {
      this.logger.error(
        `INCONSISTENT STATE: Firebase accounts deleted but DB deletion failed for ${String(matchedPublicIds.length)} user(s). Manual reconciliation required.`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

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
