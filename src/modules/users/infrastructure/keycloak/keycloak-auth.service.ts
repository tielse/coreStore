import { Injectable } from '@nestjs/common';
import { AuthServicePort } from '../../application/ports/auth-service.port';
import {
  ApplicationError,
  ErrorCode,
} from '../../../../shared/error/index.error';

@Injectable()
export class KeycloakAuthService implements AuthServicePort {
  async resetPassword(keycloakUserId: string): Promise<void> {
    try {
      // TODO: gọi Keycloak Admin API
      // POST /admin/realms/{realm}/users/{id}/reset-password
    } catch (error) {
      throw new ApplicationError(
        ErrorCode.KEYCLOAK_ERROR,
        'Failed to reset password',
        { cause: error },
      );
    }
  }
}
