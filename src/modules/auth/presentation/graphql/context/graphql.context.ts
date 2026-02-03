import { AccessTokenPayload } from '../../../config/access-token.config';

export interface GraphQLContext {
  req: Request;
  user?: AccessTokenPayload;
  token?: string;
}
