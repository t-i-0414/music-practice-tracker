import { UsersModule } from '@/api/users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [UsersModule],
})
export class ApiModule {}
