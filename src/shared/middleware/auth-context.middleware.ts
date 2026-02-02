import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthContextMiddleware.name);

  use(req: Request, _: Response, next: NextFunction): void {
    const auth = req.headers.authorization;

    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7).trim();

      if (token.split('.').length === 3) {
        req.token = token;
        this.logger.debug('Bearer token extracted');
      }
    }

    next();
  }
}
