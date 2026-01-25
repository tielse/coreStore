import { GraphQLModule, Query, Resolver } from '@nestjs/graphql';

interface GraphQLRequest {
  user?: unknown;
  token?: string;
}

interface GraphQLContext {
  req: GraphQLRequest;
}

GraphQLModule.forRoot({
  autoSchemaFile: true,
  context: ({ req }: GraphQLContext) => ({
    user: req.user,
    token: req.token,
  }),
});

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello(): string {
    return 'GraphQL Local OK';
  }
}
