import { JwtPayload } from 'jsonwebtoken';

export interface KeycloakJwtPayload extends JwtPayload {
  // ===== JWT core =====
  sub: string;
  iat: number;
  exp: number;

  iss?: string;
  aud?: string | string[];

  // ===== User info =====
  preferred_username: string;
  email?: string;
  name?: string;

  // ===== Session =====
  session_state: string;

  // ===== Roles =====
  realm_access?: {
    roles: string[];
  };

  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };
}
