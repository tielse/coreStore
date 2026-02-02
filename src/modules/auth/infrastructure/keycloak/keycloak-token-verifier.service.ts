import { Injectable } from '@nestjs/common';
import { AccessTokenVerifier } from '../../config/access-token-verifier.config';
import { verifyAccessToken } from '../security/jwt-verifier';
import { AccessTokenPayload } from '../../config/access-token.config';
import { KeycloakJwtPayload } from './keycloak-jwt-payload';

@Injectable()
export class KeycloakTokenVerifier implements AccessTokenVerifier {
  async verify(token: string): Promise<AccessTokenPayload> {
    const payload = (await verifyAccessToken(token)) as KeycloakJwtPayload;

    return {
      userId: payload.sub,
      username: payload.preferred_username,
      groups: payload.realm_access?.roles ?? [],
      sessionId: payload.session_state,
    };
  }
}
