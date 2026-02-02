export type CarStatusType = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export class CarStatus {
  private constructor(private readonly value: CarStatusType) {}

  static available() {
    return new CarStatus('AVAILABLE');
  }

  static reserved() {
    return new CarStatus('RESERVED');
  }

  static sold() {
    return new CarStatus('SOLD');
  }

  isAvailable() {
    return this.value === 'AVAILABLE';
  }

  isReserved() {
    return this.value === 'RESERVED';
  }

  isSold() {
    return this.value === 'SOLD';
  }

  getValue(): CarStatusType {
    return this.value;
  }
}
