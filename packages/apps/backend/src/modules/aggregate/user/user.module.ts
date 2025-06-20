import { RepositoryModule } from '@/modules/repository/repository.module';
import { Module } from '@nestjs/common';
import { UserAdminFacadeService } from './user.admin.facade.service';
import { UserAppFacadeService } from './user.app.facade.service';
import { UserCommandService } from './user.command.service';
import { UserQueryService } from './user.query.service';
import { UserRepositoryService } from './user.repository.service';

@Module({
  imports: [RepositoryModule],
  providers: [
    UserRepositoryService,
    UserQueryService,
    UserCommandService,
    UserAdminFacadeService,
    UserAppFacadeService,
  ],
  exports: [UserAdminFacadeService, UserAppFacadeService],
})
export class UserModule {}
