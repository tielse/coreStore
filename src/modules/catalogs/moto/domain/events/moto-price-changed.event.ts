export class MotoPriceChangedEvent {
  readonly occurredAt: Date;

  constructor(
    readonly motoId: string,
    readonly regionCode: string,
    readonly oldPrice: number,
    readonly newPrice: number,
    readonly currency: string,
    readonly changedBy: string,
  ) {
    this.occurredAt = new Date();
  }
}
