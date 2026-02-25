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
 * The service deletes all matched Firebase accounts in a single batch,
 * then removes the database records, and finally publishes a
 * `UserDeletedEvent` per entity through the domain event system.
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
   * 1. Return immediately if the input list is empty.
   * 2. Query matching users from the database.
   * 3. Return early (with a warning) if none of the requested IDs match.
   * 4. Warn if only a subset of requested IDs matched.
   * 5. Delete Firebase accounts in a single batch call.
   * 6. Delete database records.
   * 7. Publish `UserDeletedEvent` for each deleted user.
   *
   * If Firebase batch deletion throws, the error is logged and re-thrown
   * without proceeding to DB deletion. Note that `FirebaseAuthService.deleteUsers`
   * converts partial-failure batch results into a thrown error.
   *
   * If the database deletion fails after Firebase accounts have been
   * removed, the inconsistent state is logged with affected user
   * identifiers and the error is re-thrown.
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
    const matchedPublicIds = users.map((u) => u.publicId);

    try {
      await this.firebaseAuth.deleteUsers(firebaseUids);
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Firebase batch deletion failed; no DB records were modified. ` +
          `publicIds=[${matchedPublicIds.join(', ')}], affectedFirebaseAccountCount=${String(firebaseUids.length)}. ` +
          `detail=${detail}. Check Firebase console for partial deletions.`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    try {
      await this.usersCommand.deleteManyUsersById({ publicIds: matchedPublicIds });
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `INCONSISTENT STATE: Firebase accounts deleted but DB deletion failed. ` +
          `publicIds=[${matchedPublicIds.join(', ')}], affectedFirebaseAccountCount=${String(firebaseUids.length)}. ` +
          `detail=${detail}. Manual reconciliation required.`,
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
