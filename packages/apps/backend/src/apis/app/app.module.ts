import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppApiUsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppApiUsersModule,
  ],
})
export class AppApiModule {}
