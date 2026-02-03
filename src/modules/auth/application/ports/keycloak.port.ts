/**
 * Port: Keycloak Integration
 * Định nghĩa contract cho Keycloak adapter
 */

export interface IKeycloakPort {
  /**
   * Verify access token từ Keycloak
   */
  verifyToken(token: string): Promise<{
    sub: string;
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    preferred_username?: string;
    realm_access?: {
      roles: string[];
    };
    [key: string]: any;
  }>;

  /**
   * Lấy user info từ Keycloak dùng sub hoặc email
   */
  getUser(identifier: { sub?: string; email?: string }): Promise<any>;

  /**
   * Revoke token (logout từ Keycloak)
   */
  revokeToken(token: string, type: 'access' | 'refresh'): Promise<void>;

  /**
   * Admin operation: lấy danh sách users từ Keycloak
   */
  listUsers(params?: {
    first?: number;
    max?: number;
    search?: string;
  }): Promise<any[]>;

  /**
   * Admin operation: update user info trong Keycloak
   */
  updateUser(userId: string, updates: any): Promise<void>;

  /**
   * Admin operation: lấy roles của user
   */
  getUserRoles(userId: string): Promise<string[]>;
}

export const KEYCLOAK_PORT = Symbol('KEYCLOAK_PORT');
