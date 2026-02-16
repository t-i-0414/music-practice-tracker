const mockTrace = jest.fn();

jest.mock<typeof import('dd-trace')>(
  'dd-trace',
  () =>
    ({
      __esModule: true,
      default: {
        trace: mockTrace,
      },
    }) as never,
);

import { type CallHandler, type ExecutionContext } from '@nestjs/common';
import { of, throwError, firstValueFrom } from 'rxjs';

import { TracingInterceptor } from '@/apis/utils/interceptors/tracing.interceptor';

describe('unit TracingInterceptor', () => {
  let interceptor: TracingInterceptor;
  let mockGetClass: jest.Mock;
  let mockGetHandler: jest.Mock;
  let mockHandle: jest.Mock;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;

  beforeEach(() => {
    mockTrace.mockClear();
    interceptor = new TracingInterceptor();

    mockGetClass = jest.fn().mockReturnValue({ name: 'TestController' });
    mockGetHandler = jest.fn().mockReturnValue({ name: 'testMethod' });
    mockHandle = jest.fn().mockReturnValue(of({ result: 'test' }));

    mockExecutionContext = {
      getClass: mockGetClass,
      getHandler: mockGetHandler,
    };

    mockCallHandler = {
      handle: mockHandle,
    };
  });

  it('should call tracer.trace with correct span name and resource', async () => {
    expect.assertions(2);

    mockTrace.mockImplementation((_name: string, _opts: unknown, fn: () => unknown) => fn());

    const result$ = interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler);

    const value = await firstValueFrom(result$);

    expect(mockTrace).toHaveBeenCalledWith(
      'nestjs.handler',
      { resource: 'TestController.testMethod' },
      expect.any(Function),
    );
    expect(value).toStrictEqual({ result: 'test' });
  });

  it('should compose resource name from controller and handler names', async () => {
    expect.assertions(1);

    mockTrace.mockImplementation((_name: string, _opts: unknown, fn: () => unknown) => fn());

    mockGetClass.mockReturnValue({ name: 'UsersController' });
    mockGetHandler.mockReturnValue({ name: 'findAll' });

    const result$ = interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler);

    await firstValueFrom(result$);

    expect(mockTrace).toHaveBeenCalledWith(
      'nestjs.handler',
      { resource: 'UsersController.findAll' },
      expect.any(Function),
    );
  });

  it('should propagate errors from the handler', async () => {
    expect.assertions(1);

    const error = new Error('Handler error');
    mockTrace.mockImplementation((_name: string, _opts: unknown, fn: () => unknown) => fn());

    mockHandle.mockReturnValue(throwError(() => error));

    const result$ = interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler);

    await expect(firstValueFrom(result$)).rejects.toThrow(error);
  });

  it('should propagate errors from tracer.trace', async () => {
    expect.assertions(1);

    const error = new Error('Tracer error');
    mockTrace.mockRejectedValue(error);

    const result$ = interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler);

    await expect(firstValueFrom(result$)).rejects.toThrow(error);
  });
});
