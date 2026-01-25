import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }],
  });

  async onModuleInit() {
    try {
      this.prisma.$on('query', (e) => {
        console.log('SQL Builer:', e.query);
      });
      await this.prisma.$connect();
    } catch (err) {
      console.error('❌ Prisma error:', err);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // asign client để sử dụng service cho các nơi
  get client() {
    return this.prisma;
  }
}
