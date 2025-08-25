import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UserAuthTokenCommandService } from './user-auth-token.command.service';
import { USER_AUTH_TOKEN_CONSTANTS } from './user-auth-token.constants';
import { UserAuthTokenQueryService } from './user-auth-token.query.service';
import { UserAuthTokenRepositoryService } from './user-auth-token.repository.service';

import { UserModule } from '@/aggregates/user/user.module';
import { RepositoryModule } from '@/repository/repository.module';

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
  providers: [UserAuthTokenRepositoryService, UserAuthTokenQueryService, UserAuthTokenCommandService],
  exports: [UserAuthTokenQueryService, UserAuthTokenCommandService, JwtModule],
})
export class UserAuthTokenModule {}
