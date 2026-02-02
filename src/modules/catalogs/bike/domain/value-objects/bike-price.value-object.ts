// import { Money } from '../../../shared/value-object/money.value-object';

// export type FrameSize = 'S' | 'M' | 'L' | 'XL';

// export class BikePrice {
//   private constructor(
//     private readonly base: Money,
//     private readonly frameSize: FrameSize,
//   ) {}

//   static create(base: Money, frameSize: FrameSize): BikePrice {
//     return new BikePrice(base, frameSize);
//   }

//   total(): Money {
//     const frameRate: Record<FrameSize, number> = {
//       S: 1.0,
//       M: 1.05,
//       L: 1.1,
//       XL: 1.15,
//     };

//     return this.base.multiply(frameRate[this.frameSize]);
//   }

//   getFrameSize() {
//     return this.frameSize;
//   }
// }
