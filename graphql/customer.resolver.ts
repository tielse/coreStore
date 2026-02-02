import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PrismaService } from '../src/modules/prisma/prisma.service';

@Resolver('Customer')
export class CustomerResolver {
  constructor(private prisma: PrismaService) {}

  @Query('customers')
  async getCustomers(
    @Args('limit') limit?: number,
    @Args('offset') offset?: number,
  ) {
    return this.prisma.ord_customer.findMany({
      take: limit ?? 20,
      skip: offset ?? 0,
      include: {
        orders: true,
      },
      orderBy: { created_time: 'desc' },
    });
  }

  @Query('customer')
  async getCustomerById(@Args('id') id: string) {
    return this.prisma.ord_customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: { include: { car: true } },
            services: true,
            payment: true,
            // shipping: true,
          },
        },
      },
    });
  }

  @Mutation('createCustomer')
  async createCustomer(
    @Args('name') name: string,
    @Args('phone') phone: string,
    @Args('email') email?: string,
    @Args('address') address?: string,
  ) {
    return this.prisma.ord_customer.create({
      data: {
        id: `cust-${Date.now()}`,
        name,
        phone,
        email,
        address,
        created_by: 'system',
      },
    });
  }

  @Mutation('updateCustomer')
  async updateCustomer(
    @Args('id') id: string,
    @Args('name') name?: string,
    @Args('phone') phone?: string,
    @Args('email') email?: string,
    @Args('address') address?: string,
  ) {
    const updateData: any = { modified_by: 'system' };
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (address) updateData.address = address;

    return this.prisma.ord_customer.update({
      where: { id },
      data: updateData,
      include: {
        orders: true,
      },
    });
  }
}
