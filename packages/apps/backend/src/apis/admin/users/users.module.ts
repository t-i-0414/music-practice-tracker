import { Module } from '@nestjs/common';

import { AdminApiUsersController } from './users.controller';

import { UserModule } from '@/domain/aggregates/user/user.module';
import { BulkDeleteUsersService } from '@/domain/usecases/user/bulk-delete-users.service';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';
import { UpdateUserService } from '@/domain/usecases/user/update-user.service';
import { FirebaseAuthModule } from '@/firebase-auth/firebase-auth.module';

@Module({
  imports: [FirebaseAuthModule, UserModule],
  providers: [BulkDeleteUsersService, DeleteUserService, UpdateUserService],
  controllers: [AdminApiUsersController],
})
export class AdminUsersModule {}
