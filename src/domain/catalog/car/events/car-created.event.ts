import { CarPrice } from '../value-object/car-price.value-object';

export class CarCreatedEvent {
  constructor(
    readonly carId: string,
    readonly modelId: string,
    readonly year: number,
    readonly price: CarPrice,
    readonly occurredAt: Date = new Date(),
  ) {}
}
