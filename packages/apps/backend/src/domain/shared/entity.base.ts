export abstract class Entity<TProps> {
  protected readonly _publicId: string;
  protected props: TProps;

  protected constructor(publicId: string, props: TProps) {
    this._publicId = publicId;
    this.props = props;
  }

  public get publicId(): string {
    return this._publicId;
  }

  public equals(entity?: Entity<unknown>): boolean {
    if (entity === undefined) return false;
    if (entity.constructor !== this.constructor) return false;
    return this._publicId === entity._publicId;
  }
}
