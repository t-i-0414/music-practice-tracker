import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UserAuthTokenCommandService } from './command.service';
import { USER_AUTH_TOKEN_CONSTANTS } from './constants';
import { UserAuthTokenQueryService } from './query.service';

import { UserModule } from '@/aggregates/user/module';
import { RepositoryModule } from '@/repository/module';

@Module({
  imports: [
    RepositoryModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(USER_AUTH_TOKEN_CONSTANTS.JWT.SECRET_KEY),
        signOptions: { expiresIn: USER_AUTH_TOKEN_CONSTANTS.JWT.ACCESS_TOKEN_EXPIRY },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UserAuthTokenQueryService, UserAuthTokenCommandService],
  exports: [UserAuthTokenQueryService, UserAuthTokenCommandService, JwtModule],
})
export class UserAuthTokenModule {}
