import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import type { TokenPayload } from '../../infrastructure/auth/keycloak.guard';

export interface AuthEvent {
  userId: string;
  username: string;
  email?: string;
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH';
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionData {
  userId: string;
  username: string;
  email?: string;
  roles: string[];
  loginTime: string;
  ipAddress?: string;
  expiresAt: string;
}

// SOLID: Single Responsibility - Session management
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly redis: RedisService) {}

  async createSession(token: TokenPayload, ipAddress?: string): Promise<void> {
    const sessionKey = `session:${token.sub}`;
    const sessionData: SessionData = {
      userId: token.sub,
      username: token.preferred_username,
      email: token.email,
      roles: token.realm_access?.roles ?? [],
      loginTime: new Date().toISOString(),
      ipAddress,
      expiresAt: new Date(token.exp * 1000).toISOString(),
    };

    const ttl = token.exp - token.iat;
    await this.redis.set(sessionKey, sessionData, ttl);
  }

  async destroySession(userId: string): Promise<void> {
    const sessionKey = `session:${userId}`;
    await this.redis.del(sessionKey);
  }

  async getSession(userId: string): Promise<SessionData | null> {
    const sessionKey = `session:${userId}`;
    return this.redis.get<SessionData>(sessionKey);
  }

  async updateSessionTtl(
    token: TokenPayload,
    session: SessionData,
  ): Promise<void> {
    const sessionKey = `session:${token.sub}`;
    const ttl = token.exp - token.iat;
    await this.redis.set(sessionKey, session, ttl);
  }
}

// SOLID: Single Responsibility - Event publishing
@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);

  constructor(private readonly kafka: KafkaService) {}

  async publishAuthEvent(event: AuthEvent, userId: string): Promise<void> {
    try {
      await this.kafka.publishEvent('auth-events', userId, event);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to publish auth event: ${errorMsg}`);
    }
  }
}

// SOLID: Single Responsibility - Auth event orchestration
@Injectable()
export class AuthEventService {
  private readonly logger = new Logger(AuthEventService.name);

  constructor(
    private readonly session: SessionService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async handleLogin(
    token: TokenPayload,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: AuthEvent = {
      userId: token.sub,
      username: token.preferred_username,
      email: token.email,
      action: 'LOGIN',
      timestamp: Date.now(),
      ipAddress,
      userAgent,
    };

    await this.eventPublisher.publishAuthEvent(event, token.sub);
    await this.session.createSession(token, ipAddress);

    this.logger.log(
      `🔐 User logged in: ${token.preferred_username} (${token.sub})`,
    );
  }

  async handleLogout(userId: string): Promise<void> {
    const event: AuthEvent = {
      userId,
      username: 'unknown',
      action: 'LOGOUT',
      timestamp: Date.now(),
    };

    await this.eventPublisher.publishAuthEvent(event, userId);
    await this.session.destroySession(userId);

    this.logger.log(`🔓 User logged out: ${userId}`);
  }

  async getActiveSession(userId: string): Promise<SessionData | null> {
    return this.session.getSession(userId);
  }

  async handleTokenRefresh(token: TokenPayload): Promise<void> {
    const event: AuthEvent = {
      userId: token.sub,
      username: token.preferred_username,
      email: token.email,
      action: 'TOKEN_REFRESH',
      timestamp: Date.now(),
    };

    await this.eventPublisher.publishAuthEvent(event, token.sub);

    const session = await this.session.getSession(token.sub);
    if (session) {
      await this.session.updateSessionTtl(token, session);
    }

    this.logger.log(`🔄 Token refreshed for user: ${token.preferred_username}`);
  }
}
