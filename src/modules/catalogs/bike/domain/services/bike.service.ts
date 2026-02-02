// import { BikeRepository } from '../repositories/bike.repository';
// import { BikePrice } from '../value-objects/bike-price.value-object';

// export class BikeService {
//   constructor(private readonly bikeRepo: BikeRepository) {}

//   async changePrice(bikeId: string, newPrice: BikePrice) {
//     const bike = await this.bikeRepo.findById(bikeId);
//     if (!bike) throw new Error('Bike not found');

//     bike.changePrice(newPrice);
//     await this.bikeRepo.save(bike);
//   }

//   async reserveBike(bikeId: string) {
//     const bike = await this.bikeRepo.findById(bikeId);
//     if (!bike) throw new Error('Bike not found');

//     bike.reserve();
//     await this.bikeRepo.save(bike);
//   }

//   async sellBike(bikeId: string) {
//     const bike = await this.bikeRepo.findById(bikeId);
//     if (!bike) throw new Error('Bike not found');

//     bike.sell();
//     await this.bikeRepo.save(bike);
//   }

//   async deactivateBike(bikeId: string) {
//     const bike = await this.bikeRepo.findById(bikeId);
//     if (!bike) throw new Error('Bike not found');

//     bike.deactivate();
//     await this.bikeRepo.save(bike);
//   }
// }
