import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';

import { CurrentUserData } from '../decorators/current-user.decorator';

import { ApiError } from '@/apis/utils/api.error';
import { IS_PUBLIC_KEY } from '@/apis/utils/decorators/public.decorator';
import { extractTokenFromHttpHeaders } from '@/apis/utils/extract-token-from-http-headers';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly usersQueryService: UserQueryService,
    private readonly cls: ClsService,
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request>();

    const token = extractTokenFromHttpHeaders(req.headers);
    if (token === undefined) {
      throw new ApiError('AP0401', 'Authorization token not found');
    }

    const decodedIdToken = await this.firebaseAuthService.verifyIdToken(
      token,
      this.configService.get<string>('FIREBASE_CHECK_REVOKED') === 'true',
    );

    const user = await this.usersQueryService.findUniqueOrThrowUserByFirebaseUid(decodedIdToken.uid);

    const currentUser: CurrentUserData = {
      publicId: user.publicId,
      name: user.name,
    };
    req.user = currentUser;
    this.cls.set('userId', user.publicId);

    return true;
  }
}
