export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly aggregateId: string;
  public abstract readonly eventName: string;

  protected constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
