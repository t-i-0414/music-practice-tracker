import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { type UserResponseDto } from '@/domain/aggregates/user/utils/dto';

export type CurrentUserData = Pick<UserResponseDto, 'publicId' | 'name'>;

type AuthenticatedRequest = {
  user?: CurrentUserData;
};

export const CurrentUser = createParamDecorator(
  (
    dataKey: keyof CurrentUserData | undefined,
    ctx: ExecutionContext,
  ): CurrentUserData | CurrentUserData[keyof CurrentUserData] | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (dataKey && user) {
      return user[dataKey];
    }

    return user;
  },
);
