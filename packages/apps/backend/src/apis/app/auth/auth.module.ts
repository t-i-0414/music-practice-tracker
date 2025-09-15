import { Module } from '@nestjs/common';

import { AppApiAuthController } from './auth.controller';

import { UserModule } from '@/domain/aggregates/user/user.module';
import { UserUsecaseModule } from '@/domain/usecases/user/user-usecase.module';

@Module({
  imports: [UserModule, UserUsecaseModule],
  controllers: [AppApiAuthController],
})
export class AppApiAuthModule {}
