import { Bike } from '../bike/bike.entity';

export interface BikeRepository {
  findById(id: string): Promise<Bike | null>;
  findByModel(modelId: string): Promise<Bike[]>;
  save(bike: Bike): Promise<void>;
  delete(id: string): Promise<void>;
}
