import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenVerifierService } from './token-verifier.service';

export interface TokenPayload {
  sub: string;
  preferred_username: string;
  email?: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  iat: number;
  exp: number;
}

interface AuthRequest {
  headers: Record<string, string | undefined>;
  user?: TokenPayload;
  token?: string;
}

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(private readonly verifier: TokenVerifierService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const auth = req?.headers?.['authorization'];

    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = auth.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Empty token');
    }

    try {
      const payload = await this.verifier.verify(token);

      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      req.user = payload as TokenPayload;
      req.token = token;
      return true;
    } catch (error) {
      const err = error as Error;
      throw new UnauthorizedException(
        `Token validation failed: ${err.message}`,
      );
    }
  }
}
