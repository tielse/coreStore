export type MotoStatusType = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export class MotoStatus {
  private constructor(private readonly value: MotoStatusType) {}

  static available() {
    return new MotoStatus('AVAILABLE');
  }

  static reserved() {
    return new MotoStatus('RESERVED');
  }

  static sold() {
    return new MotoStatus('SOLD');
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

  getValue(): MotoStatusType {
    return this.value;
  }
}
