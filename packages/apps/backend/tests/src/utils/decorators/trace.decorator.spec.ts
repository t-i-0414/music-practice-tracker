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

import { Trace } from '@/utils/decorators/trace.decorator';

describe('unit Trace decorator', () => {
  beforeEach(() => {
    mockTrace.mockClear();
    mockTrace.mockImplementation((_name: string, _opts: unknown, fn: () => unknown) => fn());
  });

  it('should wrap method with tracer.trace using auto-generated operation name', () => {
    expect.assertions(2);

    class TestService {
      @Trace()
      public execute(): string {
        return 'result';
      }
    }

    const service = new TestService();
    const result = service.execute();

    expect(result).toBe('result');
    expect(mockTrace).toHaveBeenCalledWith(
      'domain.operation',
      { resource: 'TestService.execute' },
      expect.any(Function),
    );
  });

  it('should use custom operation name when provided', () => {
    expect.assertions(1);

    class TestService {
      @Trace('custom.operation')
      public execute(): string {
        return 'result';
      }
    }

    const service = new TestService();
    service.execute();

    expect(mockTrace).toHaveBeenCalledWith('domain.operation', { resource: 'custom.operation' }, expect.any(Function));
  });

  it('should pass through method arguments and return value', () => {
    expect.assertions(1);

    class TestService {
      @Trace()
      public findById(id: string): { id: string; name: string } {
        return { id, name: 'test' };
      }
    }

    const service = new TestService();
    const result = service.findById('abc-123');

    expect(result).toStrictEqual({ id: 'abc-123', name: 'test' });
  });

  it('should propagate errors from the original method', () => {
    expect.assertions(2);

    const error = new Error('Method error');

    class TestService {
      @Trace()
      public execute(): never {
        throw error;
      }
    }

    const service = new TestService();

    expect(() => service.execute()).toThrow(error);
    expect(mockTrace).toHaveBeenCalledWith(
      'domain.operation',
      { resource: 'TestService.execute' },
      expect.any(Function),
    );
  });

  it('should work with synchronous methods', () => {
    expect.assertions(2);

    class TestService {
      @Trace()
      public execute(): string {
        return 'sync-result';
      }
    }

    const service = new TestService();
    const result = service.execute();

    expect(result).toBe('sync-result');
    expect(mockTrace).toHaveBeenCalledWith(
      'domain.operation',
      { resource: 'TestService.execute' },
      expect.any(Function),
    );
  });

  it('should preserve this context in the wrapped method', () => {
    expect.assertions(1);

    class TestService {
      private readonly prefix = 'hello';

      @Trace()
      public greet(name: string): string {
        return `${this.prefix} ${name}`;
      }
    }

    const service = new TestService();
    const result = service.greet('world');

    expect(result).toBe('hello world');
  });
});
