import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserStatusRecord } from '@/aggregates/user/constants';
import { UserQueryService } from '@/aggregates/user/query.service';
import { USER_AUTH_TOKEN_CONSTANTS } from '@/aggregates/user-auth-token/constants';

export type Payload = {
  sub: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class AppPassportStrategy extends PassportStrategy(Strategy, 'app') {
  public constructor(
    private readonly configService: ConfigService,
    private readonly userQuery: UserQueryService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(USER_AUTH_TOKEN_CONSTANTS.JWT.SECRET_KEY),
    });
  }

  public async validate(payload: Payload): Promise<{ publicId: string; email: string; name: string }> {
    try {
      const user = await this.userQuery.findUserByIdOrFail({ publicId: payload.sub });

      if (user.status !== UserStatusRecord.ACTIVE) {
        throw new UnauthorizedException('Account is not active');
      }

      return {
        publicId: user.publicId,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('User not found or invalid token');
    }
  }
}
