export class CarReservedEvent {
  constructor(
    readonly carId: string,
    readonly reservedBy: string,
    readonly occurredAt: Date = new Date(),
  ) {}
}
