import { Module } from '@nestjs/common';
import { AppUsersModule } from '../app/users/users.module';

@Module({
  imports: [AppUsersModule],
})
export class AppApiModule {}
