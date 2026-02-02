import { Resolver, Query, Context } from '@nestjs/graphql';
import * as graphqlContext from '../context/graphql.context';
import { GqlKeycloakAuthGuard } from '../guards/gql-keycloak.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'GraphQL Local OK 🚀';
  }

  @UseGuards(GqlKeycloakAuthGuard)
  @Query(() => String)
  whoAmI(@Context() ctx: graphqlContext.GraphQLContext) {
    return ctx.user ? JSON.stringify(ctx.user) : 'Anonymous';
  }
}
