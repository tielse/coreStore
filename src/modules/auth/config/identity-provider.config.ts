/**
 * =========================
 * Identity Provider (External)
 * =========================
 * - Đại diện cho user từ hệ thống ngoài (Keycloak, Cognito, Auth0, ...)
 * - KHÔNG phải domain User
 * - KHÔNG chứa logic nghiệp vụ
 */

export interface IdentityUser {
  /**
   * ID của user trong hệ thống IdP
   * Ví dụ: keycloak userId (UUID)
   */
  externalId: string;

  /**
   * Username duy nhất trong IdP
   */
  username: string;

  /**
   * Thông tin profile (optional)
   */
  email?: string;
  fullName?: string;
  phone?: string;

  /**
   * Group / role từ IdP
   * Map sang sys_group hoặc permission nội bộ
   */
  groups: string[];
}

/**
 * =========================
 * IdentityProvider Port
 * =========================
 * - Application / Domain chỉ biết interface này
 * - Infrastructure sẽ implement (KeycloakIdentityProvider)
 */
export interface IdentityProvider {
  /**
   * Authenticate user with external Identity Provider
   *
   * @throws InvalidCredentialError | UnauthorizedError
   */
  authenticate(username: string, password: string): Promise<IdentityUser>;
}
