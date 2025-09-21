type MockFunction = jest.Mock;

export function resetAllMocks(...mocks: unknown[]): void {
  mocks.forEach((mock) => {
    if (typeof mock === 'object' && mock !== null) {
      Object.values(mock).forEach((value) => {
        if (typeof value === 'object' && value !== null) {
          Object.values(value).forEach((nestedValue) => {
            if (typeof nestedValue === 'function' && 'mockReset' in nestedValue) {
              (nestedValue as MockFunction).mockReset();
            }
          });
        } else if (typeof value === 'function' && 'mockReset' in value) {
          (value as MockFunction).mockReset();
        }
      });
    }
  });
}
