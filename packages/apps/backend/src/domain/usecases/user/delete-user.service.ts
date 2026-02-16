import { Injectable } from '@nestjs/common';

import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';
import { Trace } from '@/utils/decorators/trace.decorator';
import { Metrics } from '@/utils/metrics/dogstatsd.metrics';

@Injectable()
export class DeleteUserService {
  public constructor(
    private readonly firebaseAuth: FirebaseAuthService,
    private readonly usersQuery: UserQueryService,
    private readonly usersCommand: UserCommandService,
  ) {}

  @Trace()
  public async execute(publicId: string): Promise<void> {
    // Delete from Firebase first (treat "user-not-found" as success) → then physically delete from DB
    const user = await this.usersQuery.findUniqueOrThrowUserById({ publicId });
    await this.firebaseAuth.deleteUser(user.firebaseUid);
    await this.usersCommand.deleteUserById({ publicId });
    Metrics.incrementUserDeleted();
  }
}
