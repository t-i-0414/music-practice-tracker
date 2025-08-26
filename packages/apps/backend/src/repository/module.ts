import { Module } from '@nestjs/common';

import { RepositoryService } from './service';

@Module({
  providers: [RepositoryService],
  exports: [RepositoryService],
})
export class RepositoryModule {}
