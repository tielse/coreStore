// import { CarStatus } from '../value-object/car-status.value-object';
// import { CarPrice } from '../value-object/car-price.value-object';

// export class Car {
//   constructor(
//     readonly id: string,
//     readonly modelId: string,
//     readonly year: number,
//     private status: CarStatus,
//     private price: CarPrice,
//   ) {}

//   reserve() {
//     if (!this.status.isAvailable()) {
//       throw new Error('Car is not available');
//     }
//     this.status = CarStatus.reserved();
//   }

//   sell() {
//     if (!this.status.isReserved()) {
//       throw new Error('Car must be reserved before selling');
//     }
//     this.status = CarStatus.sold();
//   }

//   changePrice(newPrice: CarPrice) {
//     if (this.status.isSold()) {
//       throw new Error('Cannot change price of sold car');
//     }
//     this.price = newPrice;
//   }

//   getStatus() {
//     return this.status;
//   }

//   getPrice() {
//     return this.price;
//   }
// }
