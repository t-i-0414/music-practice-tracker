import { Module } from '@nestjs/common';

import { AppApiAuthController } from './auth.controller';

import { FirebaseAuthModule } from '@/domain/aggregates/firebase-auth/firebase-auth.module';
import { UserModule } from '@/domain/aggregates/user/user.module';
import { UserAuthModule } from '@/domain/usecases/user-auth/user-auth.module';

@Module({
  imports: [FirebaseAuthModule, UserModule, UserAuthModule],
  controllers: [AppApiAuthController],
})
export class AppApiAuthModule {}
