// domain/moto/value-objects/moto-price.value-object.ts
import { Money } from '../../../shared/value-object/money.value-object';

export type Region = 'NORTH' | 'CENTRAL' | 'SOUTH';

export class MotoPrice {
  private constructor(
    private readonly base: Money,
    private readonly region: Region,
  ) {}

  static create(base: Money, region: Region): MotoPrice {
    return new MotoPrice(base, region);
  }

  total(): Money {
    const regionRate: Record<Region, number> = {
      NORTH: 1.02,
      CENTRAL: 1.0,
      SOUTH: 1.05,
    };

    return this.base.multiply(regionRate[this.region]);
  }

  getRegion(): Region {
    return this.region;
  }
}
