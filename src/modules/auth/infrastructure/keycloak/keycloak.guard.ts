import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenVerifierService } from '../token/token-verifier.service';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(private readonly verifier: TokenVerifierService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: any = this.getRequest(ctx);
    const auth: any = req.headers?.authorization;

    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = auth.slice(7);
    try {
      const payload = await this.verifier.verify(token);
      req.user = payload;
      req.token = token;
      return true;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private getRequest(ctx: ExecutionContext) {
    if (ctx.getType() === 'http') {
      return ctx.switchToHttp().getRequest();
    }

    const gqlCtx = GqlExecutionContext.create(ctx);
    return gqlCtx.getContext().req;
  }
}
