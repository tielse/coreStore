/**
 * Reset Password Use Case
 * ----------------------------------------
 * - Trigger reset password flow via IAM (Keycloak)
 * - DOES NOT modify User domain
 */
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import type { UserRepositoryPort } from '../ports/user-repository.port';

import { AUTH_SERVICE } from '../ports/auth-service.port';
import type { AuthServicePort } from '../ports/auth-service.port';
import {
  ApplicationError,
  ErrorCode,
} from '../../../../shared/error/index.error';

export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,

    @Inject(AUTH_SERVICE)
    private readonly authService: AuthServicePort,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new ApplicationError(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    await this.authService.resetPassword(user.keycloakUserId);
  }
}
