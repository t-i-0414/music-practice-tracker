import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppAuthModule } from '../app/auth/auth.module';
import { AppUsersModule } from '../app/users/users.module';

import { AppAuthGuard } from '@/guards/app-auth-guard/guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppAuthModule,
    AppUsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AppAuthGuard,
    },
  ],
})
export class AppApiModule {}
