import { Injectable } from '@nestjs/common';

import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import { VerifiedTokenResponseDto } from '@/domain/aggregates/firebase-auth/utils/dto';

@Injectable()
export class VerifyFirebaseIdTokenService {
  public constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  public async execute(idToken: string): Promise<VerifiedTokenResponseDto> {
    const decodedIdToken = await this.firebaseAuth.verifyIdToken(
      idToken,
      process.env.FIREBASE_CHECK_REVOKED === 'true',
    );

    return {
      emailVerified: decodedIdToken.email_verified === true,
      signInProvider: decodedIdToken.firebase.sign_in_provider,
    };
  }
}
