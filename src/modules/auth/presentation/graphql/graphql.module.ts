import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { UserResolver } from './resolvers/user.resolver';

// ✅ IMPORT AuthModule (QUAN TRỌNG)
import { AuthModule } from '../../auth.module';

import { TokenVerifierService } from '../../infrastructure/token/token-verifier.service';

@Module({
  imports: [
    AuthModule, // ✅ 1️⃣ DÒNG BẮT BUỘC

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [AuthModule], // ✅ 2️⃣ DÒNG BẮT BUỘC
      driver: ApolloDriver,
      inject: [TokenVerifierService],
      useFactory: (tokenVerifier: TokenVerifierService) => ({
        autoSchemaFile: true,
        context: async ({ req }) => {
          const auth = req.headers?.authorization;
          const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
          return { req, token };
        },
      }),
    }),
  ],
  providers: [UserResolver],
})
export class GraphqlModule {}
