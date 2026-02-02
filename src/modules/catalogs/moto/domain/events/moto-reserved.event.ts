export class MotoReservedEvent {
  constructor(
    readonly motoId: string,
    readonly regionCode: string,
    readonly reservedBy: string,
    readonly occurredAt: Date = new Date(),
  ) {}
}
