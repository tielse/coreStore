import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PrismaService } from '../src/infrastructure/prisma.service';

@Resolver('Bike')
export class BikeResolver {
  constructor(private prisma: PrismaService) {}

  @Query('bikes')
  async getBikes(
    @Args('limit') limit?: number,
    @Args('offset') offset?: number,
  ) {
    return this.prisma.cm_bike.findMany({
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

  @Query('bike')
  async getBikeById(@Args('id') id: string) {
    return this.prisma.cm_bike.findUnique({
      where: { id },
      include: {
        model: { include: { brand: true } },
        detail: true,
        prices: true,
        images: true,
      },
    });
  }

  @Query('bikeBrands')
  async getBikeBrands() {
    return this.prisma.cm_bike_brand.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  @Query('bikeModels')
  async getBikeModels(@Args('brandId') brandId: string) {
    return this.prisma.cm_bike_model.findMany({
      where: { brand_id: brandId, status: 'ACTIVE' },
      include: { brand: true },
      orderBy: { name: 'asc' },
    });
  }

  @Mutation('updateBikePrice')
  async updateBikePrice(
    @Args('bikeId') bikeId: string,
    @Args('price') price: number,
  ) {
    return this.prisma.cm_bike_price.create({
      data: {
        id: `bike-price-${Date.now()}`,
        bike_id: bikeId,
        price: price,
        currency: 'VND',
        valid_from: new Date(),
        created_by: 'system',
      },
    });
  }

  @Mutation('updateBikeStatus')
  async updateBikeStatus(
    @Args('bikeId') bikeId: string,
    @Args('status') status: string,
  ) {
    return this.prisma.cm_bike.update({
      where: { id: bikeId },
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
