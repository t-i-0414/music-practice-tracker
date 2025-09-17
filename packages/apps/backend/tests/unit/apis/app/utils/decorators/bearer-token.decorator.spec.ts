import type { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { BearerToken } from '@/apis/app/utils/decorators/bearer-token.decorator';

type ParamFactory = (data: unknown, ctx: ExecutionContext) => unknown;

type ParamConfig = {
  factory: ParamFactory;
  data: unknown;
};

class TestController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public handler(@BearerToken() _token: string | undefined): void {}
}

const resolveFactory = (): ParamConfig => {
  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'handler');
  return Object.values(metadata)[0] as ParamConfig;
};

const createContext = (authorization?: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: authorization ? { authorization } : {},
      }),
    }),
  }) as unknown as ExecutionContext;

describe('unit BearerToken decorator', () => {
  it('extracts the bearer token from the incoming request headers', () => {
    expect.assertions(1);

    const paramConfig = resolveFactory();
    const ctx = createContext('Bearer token-value');

    const token = paramConfig.factory(paramConfig.data, ctx);

    expect(token).toBe('token-value');
  });

  it('returns undefined when no authorization header is present', () => {
    expect.assertions(1);

    const paramConfig = resolveFactory();
    const ctx = createContext();

    const token = paramConfig.factory(paramConfig.data, ctx);

    expect(token).toBeUndefined();
  });
});
