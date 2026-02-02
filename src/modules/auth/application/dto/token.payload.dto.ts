export class TokenPayloadDto {
  sub: string;
  username?: string;
  email?: string;
  groups?: string[];
  sessionId?: string;
  exp: number;
  iat: number;
}
