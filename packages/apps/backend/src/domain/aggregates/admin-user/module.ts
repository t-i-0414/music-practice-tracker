import { Module } from '@nestjs/common';

import { AdminUserCommandService } from './command.service';
import { AdminUserQueryService } from './query.service';

import { RepositoryModule } from '@/repository/module';

@Module({
  imports: [RepositoryModule],
  providers: [AdminUserQueryService, AdminUserCommandService],
  exports: [AdminUserQueryService, AdminUserCommandService],
})
export class AdminUserModule {}
