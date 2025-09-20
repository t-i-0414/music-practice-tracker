type MockFunction = jest.Mock;

function createMockFunction(): MockFunction {
  const mock = jest.fn();
  return mock;
}

export function createMockQueryService<T extends readonly string[]>(methods: T): Record<T[number], MockFunction> {
  const service: Record<string, MockFunction> = {};
  for (const method of methods) {
    service[method] = createMockFunction();
  }
  return service as Record<T[number], MockFunction>;
}

export function createMockRepository<T extends Record<string, readonly string[]>>(
  models: T,
): { [K in keyof T]: Record<T[K][number], MockFunction> } {
  const result = {} as { [K in keyof T]: Record<T[K][number], MockFunction> };

  for (const [model, methods] of Object.entries(models) as [keyof T, readonly string[]][]) {
    const modelMocks: Record<string, MockFunction> = {};
    for (const method of methods) {
      modelMocks[method] = createMockFunction();
    }
    result[model] = modelMocks;
  }

  return result;
}
