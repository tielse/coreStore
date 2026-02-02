import { AccessTokenPayload } from './access-token.config';

export interface AccessTokenIssuer {
  issue(payload: AccessTokenPayload): Promise<string>;
  getExpiry(): Date;
}
