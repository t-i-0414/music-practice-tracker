import { Module, Global } from '@nestjs/common';

import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { FirebaseAuthModule } from '@/firebase-auth/firebase-auth.module';
import { RepositoryModule } from '@/repository/repository.module';

@Global()
@Module({
  imports: [FirebaseAuthModule, RepositoryModule],
  providers: [UserQueryService],
  exports: [FirebaseAuthModule, UserQueryService],
})
export class CommonModule {}
