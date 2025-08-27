import { Module } from '@nestjs/common';

import { UserAuthTokenCommandService } from './command.service';
import { UserAuthTokenQueryService } from './query.service';

import { RepositoryModule } from '@/repository/module';

@Module({
  imports: [RepositoryModule],
  providers: [UserAuthTokenQueryService, UserAuthTokenCommandService],
  exports: [UserAuthTokenQueryService, UserAuthTokenCommandService],
})
export class UserAuthTokenModule {}
