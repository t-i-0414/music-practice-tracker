import { Module } from '@nestjs/common';

import { UserCommandService } from './command.service';
import { UserQueryService } from './query.service';

import { RepositoryModule } from '@/repository/module';

@Module({
  imports: [RepositoryModule],
  providers: [UserQueryService, UserCommandService],
  exports: [UserQueryService, UserCommandService],
})
export class UserModule {}
