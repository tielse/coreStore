/**
 * Port: Cache (Redis) Integration
 * Định nghĩa contract cho Redis cache layer
 */

export interface ICachePort {
  /**
   * Lưu value vào cache với TTL (seconds)
   */
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;

  /**
   * Lấy value từ cache
   */
  get<T = any>(key: string): Promise<T | null>;

  /**
   * Xóa key từ cache
   */
  delete(key: string): Promise<void>;

  /**
   * Xóa pattern keys (e.g., user:*)
   */
  deletePattern(pattern: string): Promise<number>;

  /**
   * Kiểm tra key tồn tại
   */
  exists(key: string): Promise<boolean>;

  /**
   * Lấy TTL của key (seconds, -1 nếu không có, -2 nếu không tồn tại)
   */
  ttl(key: string): Promise<number>;

  /**
   * Extend TTL của key
   */
  expire(key: string, ttlSeconds: number): Promise<boolean>;
}

export const CACHE_PORT = Symbol('CACHE_PORT');
