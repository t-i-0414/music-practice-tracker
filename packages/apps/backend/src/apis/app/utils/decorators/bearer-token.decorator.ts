import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

import { extractTokenFromHttpHeaders } from '@/apis/utils/extract-token-from-http-headers';

export const BearerToken = createParamDecorator<unknown, string | undefined>((_data, ctx: ExecutionContext) =>
  extractTokenFromHttpHeaders(ctx.switchToHttp().getRequest<Request>().headers),
);
