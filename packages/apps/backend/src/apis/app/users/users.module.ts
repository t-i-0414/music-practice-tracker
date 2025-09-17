import { Module } from '@nestjs/common';

import { AppApiUsersController } from './users.controller';

import { UserModule } from '@/domain/aggregates/user/user.module';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';

@Module({
  imports: [UserModule],
  providers: [DeleteUserService],
  controllers: [AppApiUsersController],
})
export class AppApiUsersModule {}
