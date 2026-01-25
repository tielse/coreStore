import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { KeycloakAuthGuard } from '../../infrastructure/auth/keycloak.guard';
import { AuthEventService } from '../../application/auth/auth-event.service';
import { TokenVerifierService } from '../../infrastructure/auth/token-verifier.service';
import { ResponseBuilder } from '../../shared/response';

interface LoginRequest {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly http: HttpService,
    private readonly authEvent: AuthEventService,
    private readonly tokenVerifier: TokenVerifierService,
    private readonly responseBuilder: ResponseBuilder,
  ) {}

  /**
   * Login bằng Keycloak (PASSWORD GRANT – chỉ dùng cho backend/internal)
   */
  @Post('login')
  async login(
    @Body() body: LoginRequest,
    @Req() req: Request,
  ): Promise<TokenResponse> {
    const {
      KEYCLOAK_CLIENT_ID,
      KEYCLOAK_CLIENT_SECRET,
      KEYCLOAK_URL,
      KEYCLOAK_REALM,
    } = process.env;

    if (
      !KEYCLOAK_CLIENT_ID ||
      !KEYCLOAK_CLIENT_SECRET ||
      !KEYCLOAK_URL ||
      !KEYCLOAK_REALM
    ) {
      throw new HttpException(
        'Missing Keycloak configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const params = new URLSearchParams();
    params.append('client_id', KEYCLOAK_CLIENT_ID);
    params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
    params.append('grant_type', 'password');
    params.append('username', body.username);
    params.append('password', body.password);

    try {
      const response = await firstValueFrom(
        this.http.post<TokenResponse>(
          `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const token = response.data;

      /**
       * Decode + verify token để lấy payload chuẩn hoá
       * (dùng cho event / mapping user nội bộ)
       */
      const payload = await this.tokenVerifier.verify(token.access_token);

      /**
       * Lấy thông tin client
       */
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown';

      const userAgent = req.headers['user-agent'];

      /**
       * Push event login (Kafka / Redis / Audit log)
       */
      await this.authEvent.handleLogin(payload, clientIp, userAgent);

      return token;
    } catch {
      throw new HttpException(
        'Failed to authenticate with Keycloak',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Logout (chỉ xử lý event nội bộ, không revoke token)
   */
  @Post('logout')
  @UseGuards(KeycloakAuthGuard)
  async logout(@Req() req: Request): Promise<{ message: string }> {
    const user = this.extractUserFromRequest(req);

    if (user?.sub) {
      await this.authEvent.handleLogout(user.sub);
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Lấy profile user từ token (REST)
   */
  @UseGuards(KeycloakAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return this.extractUserFromRequest(req);
  }

  /**
   * Trích xuất user từ request với type safety (SOLID: Single Responsibility)
   */
  private extractUserFromRequest(
    req: Request,
  ): { sub?: string; preferred_username?: string; email?: string } | undefined {
    const requestWithUser = req as Request & {
      user?: { sub?: string; preferred_username?: string; email?: string };
    };
    return requestWithUser.user;
  }
}
