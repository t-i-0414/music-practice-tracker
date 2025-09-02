export interface DateMockOptions {
  isoString?: string;
  timestamp?: number;
}

export class DateMockHelper {
  private dateNowSpy: jest.SpyInstance | null = null;
  private toISOStringSpy: jest.SpyInstance | null = null;

  public setupDateMock(options: DateMockOptions = {}): void {
    const { isoString = '2023-01-01T00:00:00.000Z', timestamp = new Date(isoString).getTime() } = options;

    this.toISOStringSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(isoString);
    this.dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(timestamp);
  }

  public restoreDateMock(): void {
    if (this.toISOStringSpy) {
      this.toISOStringSpy.mockRestore();
      this.toISOStringSpy = null;
    }
    if (this.dateNowSpy) {
      this.dateNowSpy.mockRestore();
      this.dateNowSpy = null;
    }
  }

  public getISOStringSpy(): jest.SpyInstance | null {
    return this.toISOStringSpy;
  }

  public getDateNowSpy(): jest.SpyInstance | null {
    return this.dateNowSpy;
  }
}

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
