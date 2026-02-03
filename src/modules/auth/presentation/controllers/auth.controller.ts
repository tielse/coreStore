/**
 * Auth Controller (Presentation layer)
 * Trách nhiệm: HTTP endpoints chỉ làm orchestration
 * - Nhận request từ client
 * - Gọi use-cases
 * - Format response thông qua presenters
 * - Return HTTP response
 *
 * SOLID: Duy nhất gọi use-cases, không chứa business logic
 */

import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';

import {
  LoginRequestDTO,
  LoginResponseDTO,
  LogoutRequestDTO,
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
} from '../../application/dtos';

import { LoginPresenter } from '../presenters/login.presenter';
import { LogoutPresenter } from '../presenters/logout.presenter';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private loginUseCase: LoginUseCase,
    private logoutUseCase: LogoutUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private loginPresenter: LoginPresenter,
    private logoutPresenter: LogoutPresenter,
  ) {}

  /**
   * POST /auth/login
   * Body: { token: string, ipAddress?: string, userAgent?: string }
   * Response: { sessionId, userId, email, username, expiresAt, accessToken }
   */
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginRequestDTO,
    @Req() req: Request,
  ): Promise<any> {
    try {
      // Extract IP and User-Agent if not provided
      const ipAddress =
        request.ipAddress || req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = request.userAgent || req.get('user-agent') || 'unknown';

      // Execute login use-case
      const result: LoginResponseDTO = await this.loginUseCase.execute({
        ...request,
        ipAddress,
        userAgent,
      });

      // Format response
      return this.loginPresenter.present(result);
    } catch (error) {
      this.logger.error(`Login endpoint error: ${error.message}`);
      throw error;
    }
  }

  /**
   * POST /auth/logout
   * Body: { sessionId, accessToken?, refreshToken? }
   * Response: { message: "Logout successful" }
   */
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() request: LogoutRequestDTO): Promise<any> {
    try {
      // Execute logout use-case
      await this.logoutUseCase.execute(request);

      // Format response
      return this.logoutPresenter.present();
    } catch (error) {
      this.logger.error(`Logout endpoint error: ${error.message}`);
      throw error;
    }
  }

  /**
   * POST /auth/refresh-token
   * Body: { sessionId, accessToken, refreshToken? }
   * Response: { sessionId, accessToken, expiresAt }
   */
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() request: RefreshTokenRequestDTO): Promise<any> {
    try {
      // Execute refresh token use-case
      const result: RefreshTokenResponseDTO =
        await this.refreshTokenUseCase.execute(request);

      // Format response
      return {
        sessionId: result.sessionId,
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
      };
    } catch (error) {
      this.logger.error(`Refresh token endpoint error: ${error.message}`);
      throw error;
    }
  }
}
