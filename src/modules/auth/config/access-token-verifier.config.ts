import { AccessTokenPayload } from './access-token.config';

export interface AccessTokenVerifier {
  verify(token: string): Promise<AccessTokenPayload>;
}
