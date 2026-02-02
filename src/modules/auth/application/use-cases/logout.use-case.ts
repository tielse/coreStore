import { AuthService } from '../services/auth.service.interface';
import { LogoutRequestDto } from '../dto/index.dto';

export class LogoutUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(dto: LogoutRequestDto, userId: string): Promise<void> {
    await this.authService.logout(dto, userId);
  }
}
