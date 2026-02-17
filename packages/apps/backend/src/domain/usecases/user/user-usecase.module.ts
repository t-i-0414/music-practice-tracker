import { Module } from '@nestjs/common';

import { DeleteUserService } from './delete-user.service';
import { UpdateUserService } from './update-user.service';

import { UserModule } from '@/domain/aggregates/user/user.module';
import { FirebaseAuthModule } from '@/firebase-auth/firebase-auth.module';

@Module({
  imports: [FirebaseAuthModule, UserModule],
  providers: [DeleteUserService, UpdateUserService],
  exports: [DeleteUserService, UpdateUserService],
})
export class UserUsecaseModule {}
