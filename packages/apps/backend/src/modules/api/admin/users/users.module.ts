import { UserModule } from '@/modules/aggregate/user/user.module';
import { Module } from '@nestjs/common';
import { AdminUsersController } from './users.controller';

@Module({
  imports: [UserModule],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
