export function setupDateMock(isoString = '2023-01-01T00:00:00.000Z'): {
  toISOStringSpy: jest.SpyInstance;
  dateNowSpy: jest.SpyInstance;
} {
  const toISOStringSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(isoString);
  const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(new Date(isoString).getTime());

  return { toISOStringSpy, dateNowSpy };
}

export function restoreDateMocks(...spies: jest.SpyInstance[]): void {
  spies.forEach((spy) => {
    spy.mockRestore();
  });
}
