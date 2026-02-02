import jwt from 'jsonwebtoken';
import { jwks } from './jwks.client';

export async function verifyAccessToken(token: string) {
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded === 'string') {
    throw new Error('INVALID_TOKEN');
  }

  const kid = decoded.header.kid;

  const key = await jwks.getSigningKey(kid);
  const publicKey = key.getPublicKey();

  return jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
  });
}
