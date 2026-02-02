export class CarSoldEvent {
  constructor(
    readonly carId: string,
    readonly orderId: string,
    readonly occurredAt: Date = new Date(),
  ) {}
}
