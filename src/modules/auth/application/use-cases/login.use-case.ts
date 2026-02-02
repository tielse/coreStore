import { AuthService } from '../services/auth.service.interface';
import { AuthEventService } from '../services/auth-event.service';
import { LoginCommand } from './login.command';
import { LoginResponseDto } from '../dto/index.dto';

export class LoginUseCase {
  constructor(
    private readonly authService: AuthService,
    private readonly authEventService: AuthEventService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResponseDto> {
    // 1. Authenticate
    const result = await this.authService.login(command);

    // 2. Side effects
    await this.authEventService.onLogin({
      action: 'LOGIN',
      userId: result.user.id,
      username: result.user.username,
      email: result.user.email,
      sessionId: result.session.sessionId,
      expiresAt: new Date(result.session.expiresAt),
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
    });

    return result;
  }
}
