// auth-event.service.ts

import {
  LoginEventCommand,
  TokenRefreshEventCommand,
  LogoutEventCommand,
} from './auth-event.command';

export interface AuthEventService {
  publishLogin(command: LoginEventCommand): Promise<void>;
  publishTokenRefresh(command: TokenRefreshEventCommand): Promise<void>;
  publishLogout(command: LogoutEventCommand): Promise<void>;
}
