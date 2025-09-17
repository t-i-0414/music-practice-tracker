import { Module } from '@nestjs/common';

import { DeleteUserService } from './delete-user.service';

import { FirebaseAuthModule } from '@/domain/aggregates/firebase-auth/firebase-auth.module';
import { UserModule } from '@/domain/aggregates/user/user.module';

@Module({
  imports: [FirebaseAuthModule, UserModule],
  providers: [DeleteUserService],
  exports: [DeleteUserService],
})
export class UserUsecaseModule {}
