import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

import { extractTokenFromIncomingHttpHeaders } from '@/apis/utils/extract-token-from-incoming-http-headers';

export const BearerToken = createParamDecorator<unknown, string | undefined>((_data, ctx: ExecutionContext) =>
  extractTokenFromIncomingHttpHeaders(ctx.switchToHttp().getRequest<Request>().headers),
);
