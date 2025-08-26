import { Module } from '@nestjs/common';

import { AppUsersController } from './controller';

import { UserModule } from '@/aggregates/user/module';

@Module({
  imports: [UserModule],
  controllers: [AppUsersController],
})
export class AppUsersModule {}
