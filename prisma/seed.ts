import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CREATED_BY = 'prisma';

async function main() {
  console.log('🌱 Seeding database...');

  const dbs = await prisma.$queryRaw`SELECT 1`;
  console.log('✅ DB connected:', dbs);

  // ======================================================
  // SYSTEM / IAM
  // ======================================================
  await prisma.sys_group.createMany({
    data: [
      { id: 'ADMIN', name: 'Administrator', created_by: CREATED_BY },
      { id: 'STAFF', name: 'Staff', created_by: CREATED_BY },
      { id: 'SALE', name: 'Sale', created_by: CREATED_BY },
    ],
    skipDuplicates: true,
  });

  await prisma.sys_user.createMany({
    data: [
      {
        id: 'u_admin',
        keycloak_user_id: 'kc_admin',
        username: 'admin',
        email: 'admin@test.com',
        full_name: 'System Admin',
        status: 'ACTIVE',
        created_by: CREATED_BY,
      },
      {
        id: 'u_staff',
        keycloak_user_id: 'kc_staff',
        username: 'staff',
        email: 'staff@test.com',
        full_name: 'Store Staff',
        status: 'ACTIVE',
        created_by: CREATED_BY,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.sys_user_group.createMany({
    data: [
      { user_id: 'u_admin', group_id: 'ADMIN', created_by: CREATED_BY },
      { user_id: 'u_staff', group_id: 'STAFF', created_by: CREATED_BY },
    ],
    skipDuplicates: true,
  });

  // ======================================================
  // CAR
  // ======================================================
  await prisma.cm_car_brand.create({
    data: {
      id: 'TOYOTA',
      name: 'Toyota',
      created_by: CREATED_BY,
      models: {
        create: {
          id: 'CAMRY',
          name: 'Camry',
          created_by: CREATED_BY,
          cars: {
            create: {
              id: 'CAR001',
              year: 2024,
              created_by: CREATED_BY,
              detail: {
                create: {
                  engine: '2.5L',
                  transmission: 'AT',
                  fuel_type: 'Petrol',
                  color: 'Black',
                  seat_capacity: 5,
                  mileage: 0,
                  created_by: CREATED_BY,
                },
              },
              prices: {
                create: {
                  id: 'CAR001_PRICE',
                  price: 1200000000,
                  currency: 'VND',
                  valid_from: new Date(),
                  created_by: CREATED_BY,
                },
              },
              images: {
                create: {
                  id: 'CAR001_IMG',
                  s3_url: 'https://img.fake/car1.jpg',
                  is_primary: true,
                  created_by: CREATED_BY,
                },
              },
            },
          },
        },
      },
    },
  });

  // ======================================================
  // BIKE
  // ======================================================
  await prisma.cm_bike_brand.create({
    data: {
      id: 'GIANT',
      name: 'Giant',
      created_by: CREATED_BY,
      models: {
        create: {
          id: 'ESCAPE',
          name: 'Escape 3',
          created_by: CREATED_BY,
          bikes: {
            create: {
              id: 'BIKE001',
              year: 2024,
              created_by: CREATED_BY,
              detail: {
                create: {
                  engine: 'None',
                  transmission: 'Manual',
                  fuel_type: 'Human',
                  color: 'Blue',
                  seat_capacity: 1,
                  mileage: 0,
                  created_by: CREATED_BY,
                },
              },
              prices: {
                create: {
                  id: 'BIKE001_PRICE',
                  price: 8500000,
                  currency: 'VND',
                  valid_from: new Date(),
                  created_by: CREATED_BY,
                },
              },
            },
          },
        },
      },
    },
  });

  // ======================================================
  // MOTO
  // ======================================================
  await prisma.cm_moto_brand.create({
    data: {
      id: 'HONDA',
      name: 'Honda',
      created_by: CREATED_BY,
      models: {
        create: {
          id: 'CBR150',
          name: 'CBR 150R',
          created_by: CREATED_BY,
          motos: {
            create: {
              id: 'MOTO001',
              year: 2024,
              created_by: CREATED_BY,
              detail: {
                create: {
                  engine: '150cc',
                  transmission: 'Manual',
                  fuel_type: 'Petrol',
                  color: 'Red',
                  seat_capacity: 2,
                  mileage: 0,
                  created_by: CREATED_BY,
                },
              },
              prices: {
                create: {
                  id: 'MOTO001_PRICE',
                  price: 72000000,
                  currency: 'VND',
                  valid_from: new Date(),
                  created_by: CREATED_BY,
                },
              },
            },
          },
        },
      },
    },
  });

  // ======================================================
  // SERVICE & SHIPPING
  // ======================================================
  await prisma.cm_service.createMany({
    data: [
      {
        id: 'WARRANTY',
        name: 'Extended Warranty',
        base_price: 5000000,
        currency: 'VND',
        created_by: CREATED_BY,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.cm_shipping_method.createMany({
    data: [
      {
        id: 'HOME',
        name: 'Home Delivery',
        base_fee: 2000000,
        currency: 'VND',
        created_by: CREATED_BY,
      },
    ],
    skipDuplicates: true,
  });

  // ======================================================
  // CUSTOMER & ORDER
  // ======================================================
  await prisma.ord_customer.create({
    data: {
      id: 'CUS001',
      name: 'Nguyen Van A',
      phone: '0909000000',
      email: 'a@test.com',
      created_by: CREATED_BY,
      orders: {
        create: {
          id: 'ORD001',
          total_amount: 1200000000,
          service_fee: 5000000,
          shipping_fee: 2000000,
          grand_total: 1207000000,
          currency: 'VND',
          created_by: CREATED_BY,
          items: {
            create: {
              id: 'ITEM001',
              car_id: 'CAR001',
              price: 1200000000,
              created_by: CREATED_BY,
            },
          },
          services: {
            create: {
              id: 'ORD_SERVICE_1',
              service_id: 'WARRANTY',
              price: 5000000,
              created_by: CREATED_BY,
            },
          },
          shippings: {
            create: {
              id: 'SHIP001',
              shipping_method_id: 'HOME',
              delivery_address: 'HCM City',
              fee: 2000000,
              created_by: CREATED_BY,
            },
          },
          payment: {
            create: {
              id: 'PAY001',
              provider: 'VNPAY',
              amount: 1207000000,
              status: 'PAID',
              created_by: CREATED_BY,
            },
          },
        },
      },
    },
  });

  // ======================================================
  // INVENTORY
  // ======================================================
  await prisma.cm_inventory.createMany({
    data: [
      {
        id: 'INV_CAR001',
        product_type: 'CAR',
        product_id: 'CAR001',
        quantity_total: 5,
        quantity_reserved: 1,
        quantity_available: 4,
        created_by: CREATED_BY,
      },
    ],
    skipDuplicates: true,
  });

  // ======================================================
  // REVIEW & EVENT
  // ======================================================
  await prisma.cm_review.create({
    data: {
      id: 'REV001',
      product_type: 'CAR',
      product_id: 'CAR001',
      customer_id: 'CUS001',
      rating: 5,
      title: 'Excellent',
      content: 'Very good car',
      created_by: CREATED_BY,
    },
  });

  await prisma.sys_event_log.create({
    data: {
      id: 'EVT001',
      topic: 'ORDER_CREATED',
      payload: { orderId: 'ORD001' },
    },
  });
  console.log('✓ Inventory created');

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
