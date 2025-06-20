import { RepositoryModule } from '@/modules/repository/repository.module';
import { Module } from '@nestjs/common';
import { UserCommandService } from './user.command.service';
import { UserQueryService } from './user.query.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [RepositoryModule],
  providers: [UserRepository, UserQueryService, UserCommandService],
  exports: [UserQueryService, UserCommandService],
})
export class UserModule {}
