import { AuthService } from '../services/auth.service.interface';
import {
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from '../dto/index.dto';

export class RefreshTokenUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(dto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(dto);
  }
}
