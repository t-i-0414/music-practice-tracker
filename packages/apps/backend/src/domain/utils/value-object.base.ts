export abstract class ValueObject<TProps extends Record<string, unknown>> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  public equals(vo?: ValueObject<TProps> | null): boolean {
    if (vo === undefined || vo === null) return false;
    if (vo.constructor !== this.constructor) return false;
    const thisKeys = Object.keys(this.props);
    const otherKeys = Object.keys(vo.props);
    if (thisKeys.length !== otherKeys.length) return false;
    return thisKeys.every((key) => this.props[key] === vo.props[key]);
  }

  public abstract toValue(): unknown;
}
