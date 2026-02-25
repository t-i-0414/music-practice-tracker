import type { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';

import { UserAuthGuard } from '@/apis/app/utils/guards/user-auth.guard';
import { ApiError } from '@/apis/utils/api.error';
import { IS_PUBLIC_KEY } from '@/apis/utils/decorators/public.decorator';
import type { EnvironmentVariables } from '@/config/env-validation';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';

const createExecutionContext = (request: Request): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as unknown as ExecutionContext;

describe('unit UserAuthGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let firebaseAuthService: jest.Mocked<Pick<FirebaseAuthService, 'verifyIdToken'>>;
  let usersQueryService: jest.Mocked<Pick<UserQueryService, 'findUniqueOrThrowUserByFirebaseUid'>>;
  let cls: jest.Mocked<Pick<ClsService, 'set'>>;
  let configService: { get: jest.Mock };
  let guard: UserAuthGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    firebaseAuthService = {
      verifyIdToken: jest.fn(),
    };
    usersQueryService = {
      findUniqueOrThrowUserByFirebaseUid: jest.fn(),
    };
    cls = {
      set: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };

    guard = new UserAuthGuard(
      reflector as unknown as Reflector,
      firebaseAuthService as unknown as FirebaseAuthService,
      usersQueryService as unknown as UserQueryService,
      cls as unknown as ClsService,
      configService as unknown as ConfigService<EnvironmentVariables>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows public handlers without verifying tokens', async () => {
    expect.assertions(2);

    reflector.getAllAndOverride.mockReturnValue(true);

    const request = { headers: {} } as Request;
    const context = createExecutionContext(request);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(firebaseAuthService.verifyIdToken).not.toHaveBeenCalled();
  });

  it('throws ApiError when the authorization header is missing', async () => {
    expect.assertions(1);

    reflector.getAllAndOverride.mockReturnValue(false);

    const request = { headers: {} } as Request;
    const context = createExecutionContext(request);

    await expect(guard.canActivate(context)).rejects.toThrow(ApiError);
  });

  it('verifies the token, loads the user and attaches it to the request', async () => {
    expect.assertions(6);

    reflector.getAllAndOverride.mockReturnValue(false);
    configService.get.mockReturnValue('true');

    const request = {
      headers: {
        authorization: 'Bearer access-token',
      },
    } as unknown as Request & {
      user?: unknown;
    };

    const context = createExecutionContext(request);
    const rawContext = context as unknown as { getHandler: jest.Mock; getClass: jest.Mock };
    const handler = jest.fn();
    const controller = jest.fn();
    rawContext.getHandler.mockReturnValue(handler);
    rawContext.getClass.mockReturnValue(controller);

    firebaseAuthService.verifyIdToken.mockResolvedValue({ uid: 'firebase-uid' } as never);
    usersQueryService.findUniqueOrThrowUserByFirebaseUid.mockResolvedValue({
      publicId: 'public-id',
      name: 'Current User',
    } as never);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(firebaseAuthService.verifyIdToken).toHaveBeenCalledWith('access-token', true);
    expect(usersQueryService.findUniqueOrThrowUserByFirebaseUid).toHaveBeenCalledWith('firebase-uid');
    expect(request.user).toStrictEqual({ publicId: 'public-id', name: 'Current User' });
    expect(cls.set).toHaveBeenCalledWith('userId', 'public-id');
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [handler, controller]);
  });

  it('defaults to checkRevoked=false when FIREBASE_CHECK_REVOKED is not set', async () => {
    expect.assertions(2);

    reflector.getAllAndOverride.mockReturnValue(false);
    configService.get.mockReturnValue(undefined);

    const request = {
      headers: {
        authorization: 'Bearer token-no-revoke-check',
      },
    } as unknown as Request & {
      user?: unknown;
    };

    const context = createExecutionContext(request);

    firebaseAuthService.verifyIdToken.mockResolvedValue({ uid: 'firebase-uid' } as never);
    usersQueryService.findUniqueOrThrowUserByFirebaseUid.mockResolvedValue({
      publicId: 'public-id',
      name: 'User',
    } as never);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(firebaseAuthService.verifyIdToken).toHaveBeenCalledWith('token-no-revoke-check', false);
  });

  it('propagates verification errors from FirebaseAuthService', async () => {
    expect.assertions(1);

    reflector.getAllAndOverride.mockReturnValue(false);

    const request = {
      headers: {
        authorization: 'Bearer bad-token',
      },
    } as Request;

    const context = createExecutionContext(request);

    firebaseAuthService.verifyIdToken.mockRejectedValue(new ApiError('AP0401', 'invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow('invalid token');
  });
});
