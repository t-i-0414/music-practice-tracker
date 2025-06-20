import { RepositoryModule } from '@/modules/repository/repository.module';
import { Module } from '@nestjs/common';
import { UserAdminFacade } from './user.admin.facade';
import { UserAppFacade } from './user.app.facade';
import { UserCommandService } from './user.command.service';
import { UserQueryService } from './user.query.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [RepositoryModule],
  providers: [UserRepository, UserQueryService, UserCommandService, UserAdminFacade, UserAppFacade],
  exports: [UserAdminFacade, UserAppFacade],
})
export class UserModule {}
