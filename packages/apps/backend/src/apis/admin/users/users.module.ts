import { Module } from '@nestjs/common';

import { AdminApiUsersController } from './users.controller';

import { UserUsecaseModule } from '@/domain/usecases/user/user-usecase.module';

@Module({
  imports: [UserUsecaseModule],
  controllers: [AdminApiUsersController],
})
export class AdminUsersModule {}
