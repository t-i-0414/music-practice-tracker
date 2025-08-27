import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppAuthUseCaseService } from './usecase.service';

import { UserModule } from '@/aggregates/user/module';
import { USER_AUTH_TOKEN_CONSTANTS } from '@/aggregates/user-auth-token/constants';
import { UserAuthTokenModule } from '@/aggregates/user-auth-token/module';

@Module({
  imports: [
    UserModule,
    UserAuthTokenModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(USER_AUTH_TOKEN_CONSTANTS.JWT.SECRET_KEY),
        signOptions: { expiresIn: USER_AUTH_TOKEN_CONSTANTS.JWT.ACCESS_TOKEN_EXPIRY },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AppAuthUseCaseService],
  exports: [AppAuthUseCaseService],
})
export class AppAuthModule {}
