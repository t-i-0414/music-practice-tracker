export abstract class Entity<TProps, TId extends string = string> {
  protected readonly _publicId: TId;
  /**
   * Not `readonly` by design — aggregates reassign `this.props` via spread
   * (`this.props = { ...this.props, … }`) to apply state transitions while
   * keeping each mutation explicit. Value-object immutability is enforced
   * separately by `Object.freeze` inside each VO.
   */
  protected props: TProps;

  protected constructor(publicId: TId, props: TProps) {
    this._publicId = publicId;
    this.props = props;
  }

  public get publicId(): TId {
    return this._publicId;
  }

  public equals(entity?: Entity<unknown> | null): boolean {
    if (entity === undefined || entity === null) return false;
    if (entity.constructor !== this.constructor) return false;
    return this._publicId === entity._publicId;
  }
}
