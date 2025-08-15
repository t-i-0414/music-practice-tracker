export abstract class BaseFactory<T> {
  protected counter = 0;

  public abstract build(overrides?: Partial<T>): T;

  public buildMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }

  public buildManyWithOverrides(overridesList: Partial<T>[]): T[] {
    return overridesList.map((overrides) => this.build(overrides));
  }

  public reset(): void {
    this.counter = 0;
  }

  public getCurrentCount(): number {
    return this.counter;
  }

  protected incrementCounter(): number {
    return ++this.counter;
  }
}
