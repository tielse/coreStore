export class MotoSoldEvent {
  constructor(
    readonly motoId: string,
    readonly regionCode: string,
    readonly orderId: string,
    readonly occurredAt: Date = new Date(),
  ) {}
}
