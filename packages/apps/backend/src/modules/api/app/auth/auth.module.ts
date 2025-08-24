import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AppAuthController } from './auth.controller';

import { AppPassportStrategy } from '@/guards/app-auth-guard/strategy';
import { UserModule } from '@/modules/aggregate/user/user.module';
import { UserAuthTokenModule } from '@/modules/aggregate/user-auth-token/user-auth-token.module';

@Module({
  imports: [UserAuthTokenModule, UserModule, PassportModule.register({ defaultStrategy: 'app' })],
  controllers: [AppAuthController],
  providers: [AppPassportStrategy],
})
export class AppAuthModule {}
