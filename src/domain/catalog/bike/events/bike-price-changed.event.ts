import { BikePrice } from '../value-object/bike-price.value-object';

export class BikePriceChangedEvent {
  constructor(
    readonly bikeId: string,
    readonly newPrice: BikePrice,
    readonly occurredAt: Date = new Date(),
  ) {}
}
