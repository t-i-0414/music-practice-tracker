import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { type UserResponseDto } from '@/domain/aggregates/user/utils/dto';

export type CurrentUserData = Pick<UserResponseDto, 'publicId' | 'email' | 'name'>;

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
