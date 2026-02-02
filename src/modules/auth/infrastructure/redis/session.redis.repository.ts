import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/shared/infrastructure/redis/redis.service';
import type { SessionRepository } from '../../application/ports/auth-session.repository';

export interface RedisSessionCreateInput {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

interface RedisSessionData {
  userId: string;
  expiresAt: string;
}

@Injectable()
export class RedisSessionService implements SessionRepository {
  constructor(private readonly redis: RedisService) {}

  async create(input: RedisSessionCreateInput): Promise<void> {
    const ttl = this.calculateTtl(input.expiresAt);

    await this.redis.set(
      this.getSessionKey(input.sessionId),
      {
        userId: input.userId,
        expiresAt: input.expiresAt.toISOString(),
      },
      ttl,
    );

    await this.addSessionToUser(input.userId, input.sessionId, ttl);
  }

  async refresh(sessionId: string, expiresAt: Date): Promise<void> {
    const key = this.getSessionKey(sessionId);
    const session = await this.redis.get<RedisSessionData>(key);
    if (!session) return;

    await this.redis.set(key, session, this.calculateTtl(expiresAt));
  }

  async destroy(sessionId: string): Promise<void> {
    const key = this.getSessionKey(sessionId);
    const session = await this.redis.get<RedisSessionData>(key);
    if (!session) return;

    await this.redis.del(key);
    await this.removeSessionFromUser(session.userId, sessionId);
  }

  async destroyAll(userId: string): Promise<void> {
    const key = this.getUserSessionsKey(userId);
    const sessionIds = await this.redis.get<string[]>(key);
    if (!sessionIds) return;

    for (const id of sessionIds) {
      await this.redis.del(this.getSessionKey(id));
    }

    await this.redis.del(key);
  }

  // ===== helpers =====
  private getSessionKey(id: string) {
    return `session:${id}`;
  }

  private getUserSessionsKey(userId: string) {
    return `user:${userId}:sessions`;
  }

  private async addSessionToUser(
    userId: string,
    sessionId: string,
    ttl: number,
  ) {
    const key = this.getUserSessionsKey(userId);
    const sessions = (await this.redis.get<string[]>(key)) ?? [];
    sessions.push(sessionId);
    await this.redis.set(key, sessions, ttl);
  }

  private async removeSessionFromUser(userId: string, sessionId: string) {
    const key = this.getUserSessionsKey(userId);
    const sessions = (await this.redis.get<string[]>(key)) ?? [];
    const next = sessions.filter((s) => s !== sessionId);

    next.length === 0
      ? await this.redis.del(key)
      : await this.redis.set(key, next);
  }

  private calculateTtl(expiresAt: Date): number {
    return Math.max(Math.floor((expiresAt.getTime() - Date.now()) / 1000), 0);
  }
}
