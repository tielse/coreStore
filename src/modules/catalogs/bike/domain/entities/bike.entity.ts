// import { BikePrice } from '../value-objects/bike-price.value-object';
// import { BikeStatus } from '../value-objects/bike-status.value-object';

// export class Bike {
//   constructor(
//     readonly id: string,
//     readonly modelId: string,
//     readonly year: number,
//     private price: BikePrice,
//     private status: BikeStatus,
//   ) {}

//   // ========= BUSINESS RULES =========

//   changePrice(newPrice: BikePrice) {
//     if (!this.status.isAvailable()) {
//       throw new Error('Cannot change price when bike is not available');
//     }

//     this.price = newPrice;
//   }

//   reserve() {
//     if (!this.status.isAvailable()) {
//       throw new Error('Bike is not available for reservation');
//     }
//     this.status = BikeStatus.reserved();
//   }

//   sell() {
//     if (this.status.isSold()) {
//       throw new Error('Bike already sold');
//     }
//     this.status = BikeStatus.sold();
//   }

//   deactivate() {
//     this.status = BikeStatus.inactive();
//   }

//   // ========= GETTERS =========

//   getPrice(): BikePrice {
//     return this.price;
//   }

//   getStatus(): BikeStatus {
//     return this.status;
//   }
// }
