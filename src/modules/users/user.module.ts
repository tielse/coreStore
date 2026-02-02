import { Module } from '@nestjs/common';

/**
 * Controllers
 */
import { UserController } from '../users/interfaces/controllers/user.controller';

/**
 * Use cases
 */
import { CreateUserUseCase } from '../users/application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../users/application/use-cases/update-user.use-case';
import { AssignGroupUseCase } from '../users/application/use-cases/assign-group.use-case';
import { DeleteUserUseCase } from '../users/application/use-cases/delete-user.use-case';
import { GetUserUseCase } from '../users/application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../users/application/use-cases/list-users.use-case';

/**
 * Domain ports
 */
import { USER_REPOSITORY } from '../users/domain/responsitories/user.repository.port';
import { GROUP_REPOSITORY } from '../users/domain/responsitories/group.repository.port';

/**
 * Application ports
 */
import { AUTH_SERVICE } from '../users/application/ports/auth-service.port';

/**
 * Infrastructure
 */
import { UserPrismaRepository } from '../users/infrastructure/prisma/user-prisma.repository';
import { GroupPrismaRepository } from '../users/infrastructure/prisma/group-prisma.repository';
import { KeycloakAuthService } from '../users/infrastructure/keycloak/keycloak-auth.service';

import { PrismaModule } from '../prisma/prisma.module';

// 🔥 IMPORT AUTH MODULE
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, // ✅ DÒNG FIX LỖI
  ],

  controllers: [UserController],

  providers: [
    // ===== Use cases =====
    CreateUserUseCase,
    UpdateUserUseCase,
    AssignGroupUseCase,
    DeleteUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,

    // ===== Repository bindings =====
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
    {
      provide: GROUP_REPOSITORY,
      useClass: GroupPrismaRepository,
    },

    // ===== External services =====
    {
      provide: AUTH_SERVICE,
      useClass: KeycloakAuthService,
    },
  ],

  exports: [
    GetUserUseCase,
    ListUsersUseCase,
  ],
})
export class UserModule {}
