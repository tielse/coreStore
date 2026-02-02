// import { Injectable } from '@nestjs/common';
// import type { CarRepository } from './car.repository';
// import { CarPrice } from '../value-object/car-price.value-object';

// @Injectable()
// export class CarService {
//   constructor(private readonly carRepo: CarRepository) {}

//   async changePrice(carId: string, newPrice: CarPrice) {
//     const car = await this.carRepo.findById(carId);
//     if (!car) throw new Error('Car not found');

//     car.changePrice(newPrice);
//     await this.carRepo.save(car);
//   }

//   async reserve(carId: string) {
//     const car = await this.carRepo.findById(carId);
//     if (!car) throw new Error('Car not found');

//     car.reserve();
//     await this.carRepo.save(car);
//   }

//   async sell(carId: string) {
//     const car = await this.carRepo.findById(carId);
//     if (!car) throw new Error('Car not found');

//     car.sell();
//     await this.carRepo.save(car);
//   }
// }
