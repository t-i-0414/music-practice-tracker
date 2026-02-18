import { Module } from '@nestjs/common';

import { AppApiUsersController } from './users.controller';

import { UserModule } from '@/domain/aggregates/user/user.module';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';
import { UpdateUserService } from '@/domain/usecases/user/update-user.service';

@Module({
  imports: [UserModule],
  providers: [DeleteUserService, UpdateUserService],
  controllers: [AppApiUsersController],
})
export class AppApiUsersModule {}
