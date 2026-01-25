import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import type { TokenPayload } from '../auth/keycloak.guard';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
      token?: string;
    }
  }
}

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthContextMiddleware.name);

  use(req: Request, _: Response, next: NextFunction): void {
    const auth = req.headers['authorization'];

    if (auth?.startsWith('Bearer ')) {
      const token = auth.replace('Bearer ', '');
      req.token = token;

      // Log auth attempt
      const userId = req.user?.sub || 'unknown';
      this.logger.debug(`Auth token extracted for user: ${userId}`);
    }

    next();
  }
}
