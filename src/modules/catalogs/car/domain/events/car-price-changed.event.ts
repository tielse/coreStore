export class CarPriceChangedEvent {
  readonly occurredAt: Date;

  constructor(
    readonly carId: string,
    readonly oldPrice: number,
    readonly newPrice: number,
    readonly currency: string,
    readonly changedBy: string,
  ) {
    this.occurredAt = new Date();
  }
}
