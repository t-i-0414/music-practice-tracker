export abstract class ValueObject<TProps extends Record<string, unknown>> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<TProps>): boolean {
    if (vo === undefined) return false;
    if (vo.constructor !== this.constructor) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  public abstract toValue(): unknown;
}
