import { Module } from '@nestjs/common';

import { BulkDeleteUsersService } from './bulk-delete-users.service';
import { DeleteUserService } from './delete-user.service';
import { UpdateUserService } from './update-user.service';

import { UserModule } from '@/domain/aggregates/user/user.module';
import { FirebaseAuthModule } from '@/firebase-auth/firebase-auth.module';

@Module({
  imports: [FirebaseAuthModule, UserModule],
  providers: [BulkDeleteUsersService, DeleteUserService, UpdateUserService],
  exports: [BulkDeleteUsersService, DeleteUserService, UpdateUserService, UserModule],
})
export class UserUsecaseModule {}
