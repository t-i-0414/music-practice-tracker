import { Module } from '@nestjs/common';

import { AdminUserAdminFacadeService } from './admin-user.admin.facade.service';
import { AdminUserCommandService } from './admin-user.command.service';
import { AdminUserQueryService } from './admin-user.query.service';
import { AdminUserRepositoryService } from './admin-user.repository.service';

import { RepositoryModule } from '@/modules/repository/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [AdminUserRepositoryService, AdminUserQueryService, AdminUserCommandService, AdminUserAdminFacadeService],
  exports: [AdminUserAdminFacadeService],
})
export class AdminUserModule {}
