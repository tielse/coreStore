import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AccessTokenPayload } from 'src/modules/auth/config/access-token.config';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AccessTokenPayload | undefined => {
    if (ctx.getType<'graphql'>() === 'graphql') {
      return GqlExecutionContext.create(ctx).getContext().req.user;
    }
    return ctx.switchToHttp().getRequest().user;
  },
);
