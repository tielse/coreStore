export interface IdentityUser {
  externalId: string;
  username: string;
  email?: string;
  fullName?: string;
  phone?: string;
  groups: string[];
}

export interface IdentityProvider {
  /**
   * Authenticate user with external IdP (Keycloak)
   * Throw error if credential invalid
   */
  authenticate(username: string, password: string): Promise<IdentityUser>;
}
