import { UserModule } from '@/services/user/user.module';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controllers';

@Module({
  imports: [UserModule],
  controllers: [UsersController],
})
export class UsersModule {}
