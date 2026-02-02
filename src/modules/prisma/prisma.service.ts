import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }],
    });
  }

  async onModuleInit() {
    try {
      // Optional: log SQL queries (commented due to type issues)
      // this.$on('query' as any, (e: any) => {
      //   console.log('SQL Query:', e.query);
      // });
      await this.$connect();
    } catch (err) {
      console.error('❌ Prisma error:', err);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
