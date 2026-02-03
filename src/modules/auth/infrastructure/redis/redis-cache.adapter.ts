/**
 * Redis Cache Adapter (Infrastructure layer)
 * Implements ICachePort
 * Trách nhiệm: lưu cache vào Redis
 *
 * Note: Redis client from 'redis' package requires explicit TTL management.
 * For production, consider Redis expiration via key namespacing or external ttl tracking.
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/shared/infrastructure/redis/redis.service';
import { ICachePort } from '../../application/ports/cache.port';

@Injectable()
export class RedisCacheAdapter implements ICachePort {
  private readonly logger = new Logger(RedisCacheAdapter.name);

  constructor(private redisService: RedisService) {}

  /**
   * Set value to Redis with TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redisService.set(key, serialized, ttlSeconds);
      this.logger.debug(`Cache set: ${key} (ttl: ${ttlSeconds}s)`);
    } catch (error) {
      this.logger.error(`Cache set failed for key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get value from Redis
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get<string>(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache get failed for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete key from Redis
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete failed for key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete pattern keys (e.g., user:*)
   * Note: Redis pattern deletion not directly supported by RedisService.
   * For now, we'll just log the request and return 0.
   * Implement via Redis scan cursor for production.
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      this.logger.warn(
        `Cache deletePattern requested for '${pattern}' but not fully implemented. Consider Redis SCAN for production.`,
      );
      // In production, use redis.SCAN() to iterate over keys matching pattern
      // and delete them in batches.
      return 0;
    } catch (error) {
      this.logger.error(`Cache delete pattern failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.exists(key);
      return result;
    } catch (error) {
      this.logger.error(`Cache exists check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get TTL of key (seconds)
   * Note: TTL tracking not directly supported by RedisService.
   * For production, maintain a separate metadata store or use Redis PTTL.
   */
  async ttl(key: string): Promise<number> {
    try {
      // Not available in current RedisService
      this.logger.warn(
        `TTL check requested but not implemented for key ${key}`,
      );
      return -2; // -2 = key doesn't exist or TTL not tracked
    } catch (error) {
      this.logger.error(`Cache ttl check failed: ${error.message}`);
      return -2;
    }
  }

  /**
   * Extend TTL of key
   * Note: TTL extension not directly supported by RedisService.
   * For production, re-set the key with new TTL.
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      // Workaround: fetch value, then re-set with new TTL
      const value = await this.get(key);
      if (!value) {
        return false;
      }
      await this.set(key, value, ttlSeconds);
      return true;
    } catch (error) {
      this.logger.error(`Cache expire failed: ${error.message}`);
      return false;
    }
  }
}
