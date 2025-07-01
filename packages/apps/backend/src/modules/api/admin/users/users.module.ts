import { Module } from '@nestjs/common';

import { AdminUsersController } from './users.controller';

import { UserModule } from '@/modules/aggregate/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
