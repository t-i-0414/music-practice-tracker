import { Module } from '@nestjs/common';

import { AdminUsersController } from './controller';

import { UserModule } from '@/aggregates/user/module';

@Module({
  imports: [UserModule],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
