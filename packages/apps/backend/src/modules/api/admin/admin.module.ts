import { Module } from '@nestjs/common';
import { AdminUsersModule } from './users/users.module';

@Module({
  imports: [AdminUsersModule],
})
export class AdminApiModule {}
