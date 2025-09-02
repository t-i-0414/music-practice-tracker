import { Module } from '@nestjs/common';

import { AdminUserCommandService } from './admin-user.command.service';
import { AdminUserQueryService } from './admin-user.query.service';

import { RepositoryModule } from '@/repository/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [AdminUserQueryService, AdminUserCommandService],
  exports: [AdminUserQueryService, AdminUserCommandService],
})
export class AdminUserModule {}
