import { Module } from '@nestjs/common';

import { CreateUserService } from './create-user.service';
import { DeleteUserService } from './delete-user.service';
import { VerifyFirebaseIdTokenService } from './verify-firebase-id-token.service';

import { FirebaseAuthModule } from '@/domain/aggregates/firebase-auth/firebase-auth.module';
import { UserModule } from '@/domain/aggregates/user/user.module';

@Module({
  imports: [FirebaseAuthModule, UserModule],
  providers: [DeleteUserService, VerifyFirebaseIdTokenService, CreateUserService],
  exports: [DeleteUserService, VerifyFirebaseIdTokenService, CreateUserService],
})
export class UserAuthModule {}
