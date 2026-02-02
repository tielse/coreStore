import { ApolloServerPlugin } from '@apollo/server';

export const GraphQLResponsePlugin = (): ApolloServerPlugin => ({
  async requestDidStart() {
    return {
      async willSendResponse({ response }) {
        return;
      },
    };
  },
});
