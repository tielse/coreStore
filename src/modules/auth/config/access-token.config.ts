export interface AccessTokenPayload {
  userId: string;
  username?: string;
  groups?: string[];
  sessionId: string;
}
