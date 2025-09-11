import { Injectable } from '@nestjs/common';

import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import {
  type FirebaseAuthUserDto,
  type FirebaseAuthUserResponseDto,
} from '@/domain/aggregates/firebase-auth/utils/dto';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';

@Injectable()
export class UserAuthService {
  public constructor(
    private readonly firebaseAuth: FirebaseAuthService,
    private readonly usersQuery: UserQueryService,
    private readonly usersCommand: UserCommandService,
  ) {}

  public async execute(idToken: string): Promise<FirebaseAuthUserResponseDto> {
    const decoded = await this.firebaseAuth.verifyIdToken(idToken, process.env.FIREBASE_CHECK_REVOKED === 'true');

    const user = await this.usersQuery.findUniqueOrThrowUserByFirebaseUid(decoded.uid);

    const updated = await this.usersCommand.updateUserById({
      publicId: user.publicId,
      data: {
        firebaseUid: decoded.uid,
        name: decoded.name ?? user.name,
      },
    });

    const authUser: FirebaseAuthUserDto = {
      publicId: updated.publicId,
      email: updated.email,
      name: updated.name,
    };

    return { user: authUser };
  }
}
