/**
 * AuthIdentity
 * ------------------------------------
 * Dữ liệu identity trả về từ Identity Provider
 * (Keycloak / OAuth / SSO / LDAP...)
 */
export interface AuthIdentity {
  id: string; // keycloak userId
  username: string;
  email?: string;
  groups?: string[]; // realm / client roles (optional)
}

/**
 * AuthService (Port)
 * ------------------------------------
 * - Application layer chỉ biết interface này
 * - Không biết Keycloak / Auth0 / Cognito
 */
export interface AuthService {
  authenticate(username: string, password: string): Promise<AuthIdentity>;
}
