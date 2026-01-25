// Dùng cho Giữ tồn kho, Lock inventory, Update order flow
export class BikeReservedEvent {
  constructor(
    readonly bikeId: string,
    readonly reservedBy: string, // userId / system
    readonly occurredAt: Date = new Date(),
  ) {}
}
