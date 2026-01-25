import { JwtPayload } from 'jsonwebtoken';

export interface KeycloakJwtPayload extends JwtPayload {
  preferred_username: string;
  email?: string;
  name?: string;

  realm_access?: {
    roles: string[];
  };

  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };
}
