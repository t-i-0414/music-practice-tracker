import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export type CurrentUserData = {
  userId: number;
  publicId: string;
  email: string;
  name: string;
};

type AuthenticatedRequest = {
  user?: CurrentUserData;
};

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserData | undefined,
    ctx: ExecutionContext,
  ): CurrentUserData | CurrentUserData[keyof CurrentUserData] | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (data && user) {
      return user[data];
    }

    return user;
  },
);
