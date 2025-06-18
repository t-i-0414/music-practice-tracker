import { ApiModule } from '@/modules/api/api.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ApiModule],
})
export class AppModule {}
