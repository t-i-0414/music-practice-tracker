export abstract class Entity<TProps, TId extends string = string> {
  protected readonly _publicId: TId;
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
