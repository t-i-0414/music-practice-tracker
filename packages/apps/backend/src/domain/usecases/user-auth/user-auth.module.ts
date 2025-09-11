import { Module } from '@nestjs/common';

import { UserAuthService } from './user-auth.service';

import { FirebaseAuthModule } from '@/domain/aggregates/firebase-auth/firebase-auth.module';
import { UserModule } from '@/domain/aggregates/user/user.module';

@Module({
  imports: [FirebaseAuthModule, UserModule],
  providers: [UserAuthService],
  exports: [UserAuthService],
})
export class UserAuthModule {}
