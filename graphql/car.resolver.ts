import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PrismaService } from '../src/infrastructure/prisma.service';

@Resolver('Car')
export class CarResolver {
  constructor(private prisma: PrismaService) {}

  @Query('cars')
  async getCars(
    @Args('limit') limit?: number,
    @Args('offset') offset?: number,
  ) {
    return this.prisma.cm_car.findMany({
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

  @Query('car')
  async getCarById(@Args('id') id: string) {
    return this.prisma.cm_car.findUnique({
      where: { id },
      include: {
        model: { include: { brand: true } },
        detail: true,
        prices: true,
        images: true,
      },
    });
  }

  @Query('carBrands')
  async getCarBrands() {
    return this.prisma.cm_car_brand.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  @Query('carModels')
  async getCarModels(@Args('brandId') brandId: string) {
    return this.prisma.cm_car_model.findMany({
      where: { brand_id: brandId, status: 'ACTIVE' },
      include: { brand: true },
      orderBy: { name: 'asc' },
    });
  }

  @Mutation('updateCarPrice')
  async updateCarPrice(
    @Args('carId') carId: string,
    @Args('price') price: number,
  ) {
    return this.prisma.cm_price.create({
      data: {
        id: `price-${Date.now()}`,
        car_id: carId,
        price: price,
        currency: 'VND',
        valid_from: new Date(),
        created_by: 'system',
      },
    });
  }

  @Mutation('updateCarStatus')
  async updateCarStatus(
    @Args('carId') carId: string,
    @Args('status') status: string,
  ) {
    return this.prisma.cm_car.update({
      where: { id: carId },
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
