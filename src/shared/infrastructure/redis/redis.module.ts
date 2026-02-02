import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService], // 👈 BẮT BUỘC
})
export class RedisModule {}
