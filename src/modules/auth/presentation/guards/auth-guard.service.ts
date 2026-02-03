import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenVerifierService } from '../../infrastructure/token/token-verifier.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenVerifier: TokenVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const token: string | undefined = request.token;

    if (!token) {
      throw new UnauthorizedException('TOKEN_MISSING');
    }

    try {
      const user = await this.tokenVerifier.verify(token);
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('TOKEN_INVALID');
    }
  }

  /**
   * Hỗ trợ cả HTTP & GraphQL
   */
  private getRequest(context: ExecutionContext) {
    // 👉 GraphQL
    if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext();

      /**
       * token & user được set từ GraphQL context (GraphqlModule)
       * return object giả request để dùng chung logic
       */
      return {
        token: gqlCtx.token,
        user: gqlCtx.user,
      };
    }

    // 👉 REST
    const req = context.switchToHttp().getRequest();
    return req;
  }
}
