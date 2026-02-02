import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PrismaService } from '../src/modules/prisma/prisma.service';

@Resolver('Order')
export class OrderResolver {
  constructor(private prisma: PrismaService) {}

  @Query('orders')
  async getOrders(
    @Args('limit') limit?: number,
    @Args('offset') offset?: number,
  ) {
    return this.prisma.ord_order.findMany({
      take: limit ?? 20,
      skip: offset ?? 0,
      include: {
        customer: true,
        items: { include: { car: true } },
        services: true,
        payment: true,
        // shipping: true,
      },
      orderBy: { created_time: 'desc' },
    });
  }

  @Query('order')
  async getOrderById(@Args('id') id: string) {
    return this.prisma.ord_order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { car: true } },
        services: true,
        payment: true,
        // shipping: true,
      },
    });
  }

  @Query('customerOrders')
  async getCustomerOrders(@Args('customerId') customerId: string) {
    return this.prisma.ord_order.findMany({
      where: { customer_id: customerId },
      include: {
        customer: true,
        items: { include: { car: true } },
        services: true,
        payment: true,
        // shipping: true,
      },
      orderBy: { created_time: 'desc' },
    });
  }

  @Mutation('createOrder')
  async createOrder(
    @Args('customerId') customerId: string,
    @Args('items') items: Array<{ carId: string; price: number }>,
  ) {
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    return this.prisma.ord_order.create({
      data: {
        id: `order-${Date.now()}`,
        customer_id: customerId,
        status: 'NEW',
        total_amount: totalAmount,
        grand_total: totalAmount,
        currency: 'VND',
        items: {
          createMany: {
            data: items.map((item) => ({
              id: `order-item-${Date.now()}-${Math.random()}`,
              car_id: item.carId,
              price: item.price,
              created_by: 'system',
            })),
          },
        },
        created_by: 'system',
      },
      include: {
        customer: true,
        items: { include: { car: true } },
        services: true,
        payment: true,
        // shipping: true,
      },
    });
  }

  @Mutation('updateOrderStatus')
  async updateOrderStatus(
    @Args('orderId') orderId: string,
    @Args('status') status: string,
  ) {
    return this.prisma.ord_order.update({
      where: { id: orderId },
      data: {
        status,
        modified_by: 'system',
      },
      include: {
        customer: true,
        items: { include: { car: true } },
        services: true,
        payment: true,
        // shipping: true,
      },
    });
  }

  @Mutation('addOrderService')
  async addOrderService(
    @Args('orderId') orderId: string,
    @Args('serviceId') serviceId: string,
  ) {
    const service = await this.prisma.cm_service.findUnique({
      where: { id: serviceId },
    });

    if (!service) throw new Error('Service not found');

    return this.prisma.ord_order_service.create({
      data: {
        id: `order-service-${Date.now()}`,
        order_id: orderId,
        service_id: serviceId,
        price: service.base_price,
        created_by: 'system',
      },
    });
  }

  @Mutation('processPayment')
  async processPayment(
    @Args('orderId') orderId: string,
    @Args('provider') provider: string,
    @Args('amount') amount: number,
  ) {
    return this.prisma.ord_payment.create({
      data: {
        id: `payment-${Date.now()}`,
        order_id: orderId,
        provider,
        amount,
        status: 'PENDING',
        created_by: 'system',
      },
    });
  }

  @Mutation('updateShipping')
  async updateShipping(
    @Args('orderId') orderId: string,
    @Args('deliveryAddress') deliveryAddress: string,
    @Args('methodId') methodId: string,
  ) {
    const method = await this.prisma.cm_shipping_method.findUnique({
      where: { id: methodId },
    });

    if (!method) throw new Error('Shipping method not found');

    return this.prisma.ord_shipping.create({
      data: {
        id: `shipping-${Date.now()}`,
        order_id: orderId,
        shipping_method_id: methodId,
        delivery_address: deliveryAddress,
        fee: method.base_fee,
        status: 'PENDING',
        created_by: 'system',
      },
    });
  }
}