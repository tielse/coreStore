import { Car } from '../car/car.entity';

export interface CarRepository {
  findById(id: string): Promise<Car | null>;
  save(car: Car): Promise<void>;
}
