import { AuthEventCommand } from './auth-event.command';

export interface AuthEventService {
  onLogin(command: AuthEventCommand): Promise<void>;
  onTokenRefresh(command: AuthEventCommand): Promise<void>;
  onLogout(command: {
    userId: string;
    sessionId?: string;
    logoutAll?: boolean;
  }): Promise<void>;
}
