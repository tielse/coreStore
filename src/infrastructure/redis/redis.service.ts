import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ Redis Client Error: ${(err as Error).message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis Client connected');
    });

    await this.client.connect();
  }

  async set(key: string, value: unknown, exSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (exSeconds) {
        await this.client.setEx(key, exSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      this.logger.debug(`Redis SET: ${key}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Redis SET failed: ${err.message}`);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Redis GET failed: ${err.message}`);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug(`Redis DEL: ${key}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`❌ Redis DEL failed: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.client.disconnect();
    this.logger.log('Redis Client disconnected');
  }
}
