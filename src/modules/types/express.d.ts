import { AccessTokenPayload } from '@/shared/auth/access-token.payload';

declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: AccessTokenPayload;
    }
  }
}
