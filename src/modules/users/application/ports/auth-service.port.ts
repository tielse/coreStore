/**
 * AuthServicePort
 * ------------------------------------
 * Abstraction cho hệ thống xác thực bên ngoài
 * (Keycloak, Cognito, Auth0...)
 */
export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

export interface AuthServicePort {
  /**
   * Reset password cho user thông qua external auth provider
   */
  resetPassword(keycloakUserId: string): Promise<void>;
}
