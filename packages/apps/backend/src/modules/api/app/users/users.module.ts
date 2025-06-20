import { UserModule } from '@/modules/aggregate/user/user.module';
import { Module } from '@nestjs/common';
import { AppUsersController } from './users.controller';

@Module({
  imports: [UserModule],
  controllers: [AppUsersController],
})
export class AppUsersModule {}
