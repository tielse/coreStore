import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';

import {
  LoginRequestDto,
  RefreshTokenRequestDto,
  LogoutRequestDto,
} from '../../application/dto/index.dto';

import { KeycloakAuthGuard } from '../../infrastructure/keycloak/keycloak.guard';
import { ResponseBuilder } from '../../../../shared/response/response.builder';
import { AccessTokenPayload } from '../../config/access-token.config';

type AuthenticatedRequest = Request & {
  user?: AccessTokenPayload;
  token?: string;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly responseBuilder: ResponseBuilder,
  ) {}

  // ========================= LOGIN =========================
  @Post('login')
  async login(@Body() body: LoginRequestDto, @Req() req: Request) {
    // ✅ Lấy IP chuẩn (proxy / docker / k8s đều ok)
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';

    // ✅ User agent
    const userAgent = req.headers['user-agent'];

    const result = await this.loginUseCase.execute({
      username: body.username,
      password: body.password,
      rememberMe: body.rememberMe,

      ipAddress,
      userAgent,
    });

    return this.responseBuilder.success(result);
  }

  // ========================= REFRESH =========================
  @Post('refresh')
  async refresh(@Body() body: RefreshTokenRequestDto) {
    const result = await this.refreshTokenUseCase.execute(body);

    return this.responseBuilder.success(result);
  }

  // ========================= LOGOUT =========================
  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(KeycloakAuthGuard)
  async logout(
    @Body() body: LogoutRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    await this.logoutUseCase.execute(body, req.user.userId);

    return this.responseBuilder.success({
      message: 'Logged out successfully',
    });
  }

  // ========================= PROFILE =========================
  @Get('profile')
  @ApiBearerAuth('access-token') // 🔥 TRÙNG với main.ts
  @UseGuards(KeycloakAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.responseBuilder.success(req.user);
  }
}
