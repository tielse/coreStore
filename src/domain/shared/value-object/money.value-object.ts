// Khi Car có VAT riêng và Moto có giá  thường riêng thì sẽ sử dụng money để tính
// Money = số tiền + tiền tệ (immutable, universal)
// Price = Money + rule nghiệp vụ (context-specific)

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {}

  static create(amount: number, currency = 'VND'): Money {
    if (amount < 0) throw new Error('Money must be >= 0');
    return new Money(Math.round(amount), currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  multiply(rate: number): Money {
    return Money.create(this.amount * rate, this.currency);
  }

  getAmount() {
    return this.amount;
  }

  getCurrency() {
    return this.currency;
  }

  private assertSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
  }
}
