import { Injectable } from '@nestjs/common';
import type { MotoRepository } from '../moto/moto.repository';
import { MotoPrice } from '../moto/value-object/moto-price.value-object';

@Injectable()
export class MotoService {
  constructor(private readonly motoRepo: MotoRepository) {}

  async changePrice(motoId: string, newPrice: MotoPrice) {
    const moto = await this.motoRepo.findById(motoId);
    if (!moto) throw new Error('Moto not found');

    moto.changePrice(newPrice);
    await this.motoRepo.save(moto);
  }

  async reserve(motoId: string) {
    const moto = await this.motoRepo.findById(motoId);
    if (!moto) throw new Error('Moto not found');

    moto.reserve();
    await this.motoRepo.save(moto);
  }

  async sell(motoId: string) {
    const moto = await this.motoRepo.findById(motoId);
    if (!moto) throw new Error('Moto not found');

    moto.sell();
    await this.motoRepo.save(moto);
  }
}
