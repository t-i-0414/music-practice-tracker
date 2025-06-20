import { Module } from '@nestjs/common';
import { AdminApiModule } from './admin/admin.module';
import { AppApiModule } from './app/app.module';

@Module({
  imports: [AdminApiModule, AppApiModule],
})
export class ApiModule {}
