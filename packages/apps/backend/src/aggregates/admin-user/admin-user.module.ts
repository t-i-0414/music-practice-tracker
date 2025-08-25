import { Module } from '@nestjs/common';

import { AdminUserCommandService } from './admin-user.command.service';
import { AdminUserQueryService } from './admin-user.query.service';
import { AdminUserRepositoryService } from './admin-user.repository.service';

import { RepositoryModule } from '@/repository/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [AdminUserRepositoryService, AdminUserQueryService, AdminUserCommandService],
  exports: [AdminUserQueryService, AdminUserCommandService, AdminUserRepositoryService],
})
export class AdminUserModule {}
