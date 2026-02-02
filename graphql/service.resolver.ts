import { Resolver, Query } from '@nestjs/graphql';
import { PrismaService } from '../src/modules/prisma/prisma.service';

@Resolver('Service')
export class ServiceResolver {
  constructor(private prisma: PrismaService) {}

  @Query('services')
  async getServices() {
    return this.prisma.cm_service.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  @Query('shippingMethods')
  async getShippingMethods() {
    return this.prisma.cm_shipping_method.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }
}
