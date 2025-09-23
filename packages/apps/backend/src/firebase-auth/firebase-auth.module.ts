import { Module } from '@nestjs/common';

import { FirebaseAuthProvider } from './firebase-auth.provider';
import { FirebaseAuthService } from './firebase-auth.service';

@Module({
  providers: [FirebaseAuthProvider, FirebaseAuthService],
  exports: [FirebaseAuthService],
})
export class FirebaseAuthModule {}
