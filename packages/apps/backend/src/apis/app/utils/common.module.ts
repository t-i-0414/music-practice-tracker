import { Module, Global } from '@nestjs/common';

import { FirebaseAuthModule } from '@/domain/aggregates/firebase-auth/firebase-auth.module';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { RepositoryModule } from '@/repository/repository.module';



@Global()
@Module({
  imports: [FirebaseAuthModule,RepositoryModule],
  providers: [UserQueryService],
  exports: [FirebaseAuthModule,UserQueryService],
})
export class CommonModule {}
