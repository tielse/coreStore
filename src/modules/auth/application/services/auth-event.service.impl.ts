import { Injectable } from '@nestjs/common';
import { KafkaAuthEventPublisher } from '../../infrastructure/event/kafka-auth-event.publisher';
import {
  AuthAction,
  LoginEventCommand,
  TokenRefreshEventCommand,
  LogoutEventCommand,
} from './auth-event.command';
import { AuthEventService } from './auth-event.service';
import { now } from '../../../../shared/utils/time.util';
@Injectable()
export class AuthEventServiceImpl implements AuthEventService {
  constructor(private readonly publisher: KafkaAuthEventPublisher) {}

  async publishLogin(command: LoginEventCommand): Promise<void> {
    await this.publisher.publish({
      action: AuthAction.LOGIN,
      userId: command.userId,
      username: command.username,
      email: command.email,
      sessionId: command.sessionId,
      expiresAt: command.expiresAt,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      timestamp: now().getTime(),
    });
  }

  async publishTokenRefresh(command: TokenRefreshEventCommand): Promise<void> {
    await this.publisher.publish({
      action: AuthAction.TOKEN_REFRESH,
      userId: command.userId,
      sessionId: command.sessionId,
      expiresAt: command.expiresAt,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      timestamp: now().getTime(),
    });
  }

  async publishLogout(command: LogoutEventCommand): Promise<void> {
    await this.publisher.publish({
      action: AuthAction.LOGOUT,
      userId: command.userId,
      sessionId: command.sessionId,
      logoutAll: command.logoutAll,
      timestamp: now().getTime(),
    });
  }
}
