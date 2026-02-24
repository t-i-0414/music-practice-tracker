import { Module } from '@nestjs/common';

import { AdminApiUsersController } from './users.controller';

import { UserModule } from '@/domain/aggregates/user/user.module';
import { UserUsecaseModule } from '@/domain/usecases/user/user-usecase.module';

@Module({
  imports: [UserModule, UserUsecaseModule],
  controllers: [AdminApiUsersController],
})
export class AdminUsersModule {}
