import { Money } from '../../../shared/value-object/money.value-object';

export class CarPrice {
  private constructor(
    private readonly base: Money,
    private readonly vatRate: number, // e.g 0.1
  ) {}

  static create(base: Money, vatRate = 0.1): CarPrice {
    if (vatRate < 0 || vatRate > 1) {
      throw new Error('Invalid VAT rate');
    }
    return new CarPrice(base, vatRate);
  }

  total(): Money {
    return this.base.add(this.base.multiply(this.vatRate));
  }

  basePrice(): Money {
    return this.base;
  }

  vatAmount(): Money {
    return this.base.multiply(this.vatRate);
  }
}
