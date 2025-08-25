import { Module } from '@nestjs/common';

import { UserCommandService } from './user.command.service';
import { UserQueryService } from './user.query.service';
import { UserRepositoryService } from './user.repository.service';

import { RepositoryModule } from '@/repository/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [UserRepositoryService, UserQueryService, UserCommandService],
  exports: [UserQueryService, UserCommandService, UserRepositoryService],
})
export class UserModule {}
