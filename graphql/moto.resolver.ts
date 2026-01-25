import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PrismaService } from '../src/infrastructure/prisma.service';

@Resolver('Moto')
export class MotoResolver {
  constructor(private prisma: PrismaService) {}

  @Query('motos')
  async getMotos(
    @Args('limit') limit?: number,
    @Args('offset') offset?: number,
  ) {
    return this.prisma.cm_moto.findMany({
      take: limit ?? 20,
      skip: offset ?? 0,
      include: {
        model: { include: { brand: true } },
        detail: true,
        prices: true,
        images: true,
      },
      orderBy: { created_time: 'desc' },
    });
  }

  @Query('moto')
  async getMotoById(@Args('id') id: string) {
    return this.prisma.cm_moto.findUnique({
      where: { id },
      include: {
        model: { include: { brand: true } },
        detail: true,
        prices: true,
        images: true,
      },
    });
  }

  @Query('motoBrands')
  async getMotoBrands() {
    return this.prisma.cm_moto_brand.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  @Query('motoModels')
  async getMotoModels(@Args('brandId') brandId: string) {
    return this.prisma.cm_moto_model.findMany({
      where: { brand_id: brandId, status: 'ACTIVE' },
      include: { brand: true },
      orderBy: { name: 'asc' },
    });
  }

  @Mutation('updateMotoPrice')
  async updateMotoPrice(
    @Args('motoId') motoId: string,
    @Args('price') price: number,
  ) {
    return this.prisma.cm_moto_price.create({
      data: {
        id: `moto-price-${Date.now()}`,
        moto_id: motoId,
        price: price,
        currency: 'VND',
        valid_from: new Date(),
        created_by: 'system',
      },
    });
  }

  @Mutation('updateMotoStatus')
  async updateMotoStatus(
    @Args('motoId') motoId: string,
    @Args('status') status: string,
  ) {
    return this.prisma.cm_moto.update({
      where: { id: motoId },
      data: {
        status,
        modified_by: 'system',
      },
      include: {
        model: { include: { brand: true } },
        detail: true,
        prices: true,
        images: true,
      },
    });
  }
}
