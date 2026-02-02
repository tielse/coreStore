// import { MotoStatus } from './value-object/moto-status.value-object';
// import { MotoPrice } from './value-object/moto-price.value-object';

// export class Moto {
//   constructor(
//     readonly id: string,
//     readonly modelId: string,
//     readonly regionCode: string,
//     private status: MotoStatus,
//     private price: MotoPrice,
//   ) {}

//   reserve() {
//     if (!this.status.isAvailable()) {
//       throw new Error('Moto is not available');
//     }
//     this.status = MotoStatus.reserved();
//   }

//   sell() {
//     if (!this.status.isReserved()) {
//       throw new Error('Moto must be reserved before selling');
//     }
//     this.status = MotoStatus.sold();
//   }

//   changePrice(newPrice: MotoPrice) {
//     if (this.status.isSold()) {
//       throw new Error('Cannot change price of sold moto');
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
