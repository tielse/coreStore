import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenVerifierService } from 'src/modules/auth/infrastructure/token/token-verifier.service';
import { AccessTokenPayload } from 'src/modules/auth/config/access-token.config';

@Injectable()
export class GqlKeycloakAuthGuard implements CanActivate {
  constructor(private readonly tokenVerifier: TokenVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();

    const req = ctx.req;
    const auth = req.headers?.authorization;

    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = auth.slice(7);

    try {
      const user: AccessTokenPayload = await this.tokenVerifier.verify(token);

      // GẮN CHUẨN HÓA CONTEXT
      req.user = user;
      req.token = token;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
