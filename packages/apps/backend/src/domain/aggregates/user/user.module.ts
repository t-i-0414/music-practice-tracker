import { Module } from '@nestjs/common';

import { UserCommandService } from './user.command.service';
import { UserQueryService } from './user.query.service';

import { RepositoryModule } from '@/repository/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [UserQueryService, UserCommandService],
  exports: [UserQueryService, UserCommandService],
})
export class UserModule {}
