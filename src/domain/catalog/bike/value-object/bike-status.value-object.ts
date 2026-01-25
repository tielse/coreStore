export enum BikeStatusEnum {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  INACTIVE = 'INACTIVE',
}

export class BikeStatus {
  private constructor(private readonly value: BikeStatusEnum) {}

  static available() {
    return new BikeStatus(BikeStatusEnum.AVAILABLE);
  }

  static reserved() {
    return new BikeStatus(BikeStatusEnum.RESERVED);
  }

  static sold() {
    return new BikeStatus(BikeStatusEnum.SOLD);
  }

  static inactive() {
    return new BikeStatus(BikeStatusEnum.INACTIVE);
  }

  static from(value: string): BikeStatus {
    if (!Object.values(BikeStatusEnum).includes(value as BikeStatusEnum)) {
      throw new Error(`Invalid bike status: ${value}`);
    }
    return new BikeStatus(value as BikeStatusEnum);
  }

  isAvailable(): boolean {
    return this.value === BikeStatusEnum.AVAILABLE;
  }

  isSold(): boolean {
    return this.value === BikeStatusEnum.SOLD;
  }

  getValue(): BikeStatusEnum {
    return this.value;
  }
}
