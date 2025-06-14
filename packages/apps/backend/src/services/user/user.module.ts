import { RepositoryModule } from '@/repository/repository.module';
import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [RepositoryModule],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
