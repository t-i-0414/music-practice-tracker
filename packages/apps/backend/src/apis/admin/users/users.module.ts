import { Module } from '@nestjs/common';

import { AdminApiUsersController } from './users.controller';

import { UserModule } from '@/domain/aggregates/user/user.module';
import { UpdateUserService } from '@/domain/usecases/user/update-user.service';

@Module({
  imports: [UserModule],
  providers: [UpdateUserService],
  controllers: [AdminApiUsersController],
})
export class AdminUsersModule {}
