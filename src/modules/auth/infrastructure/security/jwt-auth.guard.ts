import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('NO_TOKEN');
    }

    const token = authHeader.replace('Bearer ', '');

    const payload = await verifyKeycloakAccessToken(token);

    // attach user info to request
    request.user = payload;

    return true;
  }
}
function verifyKeycloakAccessToken(token: any) {
  throw new Error('Function not implemented.');
}
