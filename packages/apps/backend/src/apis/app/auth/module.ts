import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AppAuthController } from './controller';

import { UserModule } from '@/aggregates/user/module';
import { UserAuthTokenModule } from '@/aggregates/user-auth-token/module';
import { AppPassportStrategy } from '@/guards/app-auth-guard/strategy';

@Module({
  imports: [UserAuthTokenModule, UserModule, PassportModule.register({ defaultStrategy: 'app' })],
  controllers: [AppAuthController],
  providers: [AppPassportStrategy],
})
export class AppAuthModule {}
