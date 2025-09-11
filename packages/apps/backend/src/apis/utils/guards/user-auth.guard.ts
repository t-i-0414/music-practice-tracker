import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ApiError } from '../api.error';
import { CurrentUserData } from '../decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly usersQueryService: UserQueryService,
  ) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const { authorization } = req.headers;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
      throw new ApiError('AP0401', 'No bearer token');
    }

    const decodedIdToken = await this.firebaseAuthService.verifyIdToken(
      authorization.slice('Bearer '.length).trim(),
      process.env.FIREBASE_CHECK_REVOKED === 'true',
    );

    if (!decodedIdToken.uid) {
      throw new ApiError('AP0401', 'Invalid token: missing uid');
    }

    const user = await this.usersQueryService.findUniqueOrThrowUserByFirebaseUid(decodedIdToken.uid);

    const currentUser: CurrentUserData = {
      publicId: user.publicId,
      email: user.email,
      name: user.name,
    };
    req.user = currentUser;

    return true;
  }
}
