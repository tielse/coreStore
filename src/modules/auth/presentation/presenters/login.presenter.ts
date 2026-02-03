/**
 * Login Presenter (Presentation layer)
 * Trách nhiệm: format login response để trả về client
 */

import { Injectable } from '@nestjs/common';
import { LoginResponseDTO } from '../../application/dtos/login.response.dto';
import { now } from 'src/shared/utils/time.util';
@Injectable()
export class LoginPresenter {
  present(dto: LoginResponseDTO): Record<string, any> {
    return {
      sessionId: dto.sessionId,
      userId: dto.userId,
      email: dto.email,
      username: dto.username,
      fullName: dto.fullName,
      expiresAt: dto.expiresAt,
      accessToken: dto.accessToken,
      expiresIn: Math.round((dto.expiresAt.getTime() - now().getTime()) / 1000), // in seconds
    };
  }
}
