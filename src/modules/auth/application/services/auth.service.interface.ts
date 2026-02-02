import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  LogoutRequestDto,
} from '../dto/index.dto';

export interface AuthService {
  login(dto: LoginRequestDto): Promise<LoginResponseDto>;
  refreshToken(dto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto>;
  logout(dto: LogoutRequestDto, userId: string): Promise<void>;
}
