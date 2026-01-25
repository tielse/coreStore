import jwt, { JwtHeader } from 'jsonwebtoken';
import { jwks } from './jwks.client';
import { KeycloakJwtPayload } from './keycloak-jwt-payload';
export class TokenVerifierService {
  async verify(token: string): Promise<KeycloakJwtPayload> {
    const decoded = jwt.decode(token, {
      complete: true,
    }) as { header: JwtHeader } | null;

    if (!decoded || !decoded.header.kid) {
      throw new Error('Invalid JWT token');
    }

    const key = await jwks.getSigningKey(decoded.header.kid);
    const publicKey = key.getPublicKey();

    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    }) as KeycloakJwtPayload;
  }
}
