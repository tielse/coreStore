import { Injectable } from '@nestjs/common';
import jwt, { JwtHeader } from 'jsonwebtoken';
import { jwks } from '../security/jwks.client';
import { KeycloakJwtPayload } from '../keycloak/keycloak-jwt-payload';
import { AccessTokenPayload } from '../../config/access-token.config';

@Injectable()
export class TokenVerifierService {
  async verify(token: string): Promise<AccessTokenPayload> {
    const decoded = jwt.decode(token, { complete: true }) as {
      header: JwtHeader;
    } | null;

    if (!decoded?.header?.kid) {
      throw new Error('INVALID_JWT_HEADER');
    }

    const key = await jwks.getSigningKey(decoded.header.kid);
    const publicKey = key.getPublicKey();

    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    }) as KeycloakJwtPayload;

    return {
      userId: payload.sub,
      username: payload.preferred_username,
      groups: payload.realm_access?.roles ?? [],
      sessionId: payload.session_state ?? '',
    };
  }
}
