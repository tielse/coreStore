import { Injectable, Inject } from '@nestjs/common';
import { KafkaAuthEventPublisher } from '../../infrastructure/event/kafka-auth-event.publisher';
import type { SessionRepository } from '../ports/auth-session.repository';
import { SESSION_REPOSITORY } from '../ports/auth-session.repository';
import type { AuthEventService } from './auth-event.service';
import { AuthEventCommand } from './auth-event.command';

@Injectable()
export class AuthEventServiceImpl implements AuthEventService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,
    private readonly publisher: KafkaAuthEventPublisher,
  ) {}

  async onLogin(command: AuthEventCommand): Promise<void> {
    await this.publisher.publish({
      userId: command.userId,
      username: command.username,
      email: command.email,
      sessionId: command.sessionId,
      action: 'LOGIN',
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      timestamp: Date.now(),
    });

    await this.sessionRepo.create({
      sessionId: command.sessionId,
      userId: command.userId,
      expiresAt: command.expiresAt,
    });
  }

  async onTokenRefresh(command: AuthEventCommand): Promise<void> {
    await this.publisher.publish({
      userId: command.userId,
      username: command.username,
      sessionId: command.sessionId,
      action: 'TOKEN_REFRESH',
      timestamp: Date.now(),
    });

    await this.sessionRepo.refresh(command.sessionId, command.expiresAt);
  }

  async onLogout(command: {
    userId: string;
    sessionId?: string;
    logoutAll?: boolean;
  }): Promise<void> {
    await this.publisher.publish({
      userId: command.userId,
      sessionId: command.sessionId,
      action: 'LOGOUT',
      timestamp: Date.now(),
    });

    if (command.logoutAll) {
      await this.sessionRepo.destroyAll(command.userId);
      return;
    }

    if (command.sessionId) {
      await this.sessionRepo.destroy(command.sessionId);
    }
  }
}
