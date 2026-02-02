import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6380';

    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 50, 500);
          this.logger.warn(
            `♻️ Redis reconnect attempt #${retries}, retry in ${delay}ms`,
          );
          return delay;
        },
      },
    });

    this.client.on('connect', () => {
      this.logger.log('🔌 Redis connecting...');
    });

    this.client.on('ready', () => {
      this.logger.log('✅ Redis ready to use');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('♻️ Redis reconnecting...');
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ Redis error: ${err.message}`);
    });

    // 🚀 QUAN TRỌNG: KHÔNG await → tránh treo NestJS
    this.client.connect().catch((err) => {
      this.logger.error('❌ Redis initial connection failed', err);
    });
  }

  // =========================
  // Internal helpers
  // =========================
  private ensureConnected() {
    if (!this.client || !this.client.isOpen) {
      throw new Error('Redis is not connected');
    }
  }

  // =========================
  // Public APIs
  // =========================
  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    this.ensureConnected();

    const payload = JSON.stringify(value);

    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.setEx(key, ttlSeconds, payload);
    } else {
      await this.client.set(key, payload);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    this.ensureConnected();

    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    this.ensureConnected();
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    this.ensureConnected();
    return (await this.client.exists(key)) === 1;
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) {
      await this.client.disconnect();
      this.logger.log('🛑 Redis disconnected');
    }
  }
}
