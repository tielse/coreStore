# 📋 Complete Backend Refactoring - Action Plan

**Status**: ✅ Auth Module Clean (0 errors) | 🔄 Users Module Refactor In Progress  
**Date**: February 3, 2026  
**Goal**: Apply Clean Architecture + DDD + SOLID to entire backend (auth + users)

---

## 🎯 Current State

### ✅ Completed
1. **Auth module** - Full Clean Architecture implementation complete and production-ready
2. **Build status** - 0 TypeScript compilation errors (both modules)
3. **Markdown fences** - Stripped from all files (auth + users)
4. **Decorator errors** - Fixed with type-only imports for interfaces
5. **Kafka integration** - Updated to use `publishEvent()` method correctly
6. **User entity** - Constructor fixed to be public (allows factory pattern)

### 🔄 In Progress / TODO
1. **Users module** - Needs port-to-adapter refactoring (mirrors auth pattern)
2. **Users presenters** - Need response DTOs and presenters
3. **Users module DI** - Need proper wiring in user.module.ts
4. **Tests** - Add unit/integration tests for users module
5. **Cleanup** - Remove redundant/old files

---

## 📂 Users Module Refactoring Plan

### Phase 1: Create Application Ports (Abstract Contracts)

**Location**: `src/modules/users/application/ports/`

Files to create/update:

```
src/modules/users/application/ports/
├── index.ts                          ← New: Central re-export
├── user-repository.port.ts           ← Update: Define interface + symbol
├── group-repository.port.ts          ← Update: Define interface + symbol
├── keycloak-user.port.ts            ← New: Keycloak user management
├── cache.port.ts                     ← New: User cache operations
└── kafka.port.ts                     ← New: User events publishing
```

**Example structure (following auth pattern)**:

```typescript
// user-repository.port.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByKeycloakId(keycloakId: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  list(filter?: ListUsersFilter): Promise<PaginatedResult<User>>;
  delete(id: string): Promise<void>;
  listByGroupId(groupId: string): Promise<User[]>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
```

### Phase 2: Create/Update Use-Cases (Business Logic)

**Location**: `src/modules/users/application/use-cases/`

Refactor each use-case to follow the Clean Architecture pattern:

#### Template Use-Case Structure:

```typescript
import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import type {
  IUserRepository,
  IKeycloakUserPort,
  ICachePort,
  IKafkaPort,
} from '../ports';
import {
  USER_REPOSITORY,
  KEYCLOAK_USER_PORT,
  CACHE_PORT,
  KAFKA_PORT,
} from '../ports';

@Injectable()
export class ListUsersUseCase {
  private readonly logger = new Logger(ListUsersUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,

    @Inject(CACHE_PORT)
    private cachePort: ICachePort,

    @Inject(KAFKA_PORT)
    private kafkaPort: IKafkaPort,
  ) {}

  async execute(filter: ListUsersFilter): Promise<PaginatedResult<User>> {
    try {
      // Step 1: Check cache
      const cacheKey = `users:list:${JSON.stringify(filter)}`;
      let cached = await this.cachePort.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Step 2: Query DB
      const result = await this.userRepository.list(filter);

      // Step 3: Cache result (TTL: 5 minutes)
      await this.cachePort.set(cacheKey, result, 300);

      // Step 4: Publish event (optional - if needed for audit)
      await this.kafkaPort.publishUserListQueried({
        actorId: filter.actorId,
        filter,
        timestamp: new Date(),
      });

      return result;
    } catch (error) {
      this.logger.error(`List users failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to list users');
    }
  }
}
```

#### Use-Cases to Refactor:

- ✅ `create-user.use-case.ts` - Already updated
- ✅ `update-user.use-case.ts` - Already updated
- `list-users.use-case.ts` - Add cache layer + event publishing
- `get-user.use-case.ts` - Add cache layer
- `delete-user.use-case.ts` - Invalidate cache + publish event
- `block-user.use-case.ts` - Invalidate cache + publish event
- `assign-group.use-case.ts` - Update both user and group caches + event
- `reset-password.use-case.ts` - Call Keycloak + event publishing

### Phase 3: Create Infrastructure Adapters

**Location**: `src/modules/users/infrastructure/`

```
src/modules/users/infrastructure/
├── prisma/
│   ├── user-prisma.repository.ts   ← Already exists (verify it's correct)
│   └── group-prisma.repository.ts  ← Already exists
├── keycloak/
│   └── keycloak-user.adapter.ts    ← New: Keycloak user management
├── redis/
│   └── redis-cache.adapter.ts      ← New: User cache implementation
└── kafka/
    └── kafka-user-events.adapter.ts ← New: User events publishing
```

### Phase 4: Create Presenters (Response Formatters)

**Location**: `src/modules/users/presentation/presenters/`

```typescript
// user.presenter.ts
@Injectable()
export class UserPresenter {
  present(user: User): Record<string, any> {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      groups: user.groupIds,
      createdAt: user.createdTime,
      createdBy: user.createdBy,
    };
  }

  presentList(users: User[]): Record<string, any>[] {
    return users.map(u => this.present(u));
  }
}
```

### Phase 5: Update Module DI Wiring

**File**: `src/modules/users/user.module.ts`

```typescript
import { Module } from '@nestjs/common';

// Controllers
import { UserController } from './interfaces/controllers/user.controller';

// Presenters
import { UserPresenter } from './presentation/presenters/user.presenter';

// Use-Cases
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
// ... other use-cases

// Adapters
import { UserPrismaRepository } from './infrastructure/prisma/user-prisma.repository';
import { GroupPrismaRepository } from './infrastructure/prisma/group-prisma.repository';
import { KeycloakUserAdapter } from './infrastructure/keycloak/keycloak-user.adapter';
import { RedisCacheAdapter } from './infrastructure/redis/redis-cache.adapter';
import { KafkaUserEventsAdapter } from './infrastructure/kafka/kafka-user-events.adapter';

// Ports
import {
  USER_REPOSITORY,
  GROUP_REPOSITORY,
  KEYCLOAK_USER_PORT,
  CACHE_PORT,
  KAFKA_PORT,
} from './application/ports';

// Shared modules
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { KafkaModule } from 'src/shared/infrastructure/kafka/kafka.module';
import { RedisModule } from 'src/shared/infrastructure/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    KafkaModule,
    RedisModule,
  ],

  controllers: [UserController],

  providers: [
    // Presenters
    UserPresenter,

    // Use-Cases
    CreateUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    // ... other use-cases

    // Adapters
    UserPrismaRepository,
    GroupPrismaRepository,
    KeycloakUserAdapter,
    RedisCacheAdapter,
    KafkaUserEventsAdapter,

    // DI Bindings (Port → Implementation)
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
    {
      provide: GROUP_REPOSITORY,
      useClass: GroupPrismaRepository,
    },
    {
      provide: KEYCLOAK_USER_PORT,
      useClass: KeycloakUserAdapter,
    },
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
    {
      provide: KAFKA_PORT,
      useClass: KafkaUserEventsAdapter,
    },
  ],

  exports: [
    // Export for other modules
    CreateUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UserModule {}
```

---

## 🗑️ Files to Delete/Consolidate

### Auth Module Cleanup

Already done ✅. No additional cleanup needed.

### Users Module Cleanup

Check and remove if present:

```
- src/modules/users/application/services/ (if exists - replace with use-cases)
- src/modules/users/shared/ (move to application/dtos or rm if not used)
- src/modules/users/application/dto/ (rename to dtos/ for consistency with auth)
- Any *-old.ts or *-backup.ts files
- Duplicate controller files (if any)
```

---

## 📝 Testing Strategy

### Unit Tests

Create test files for each use-case:

```typescript
// src/modules/users/application/use-cases/list-users.use-case.spec.ts
describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockCachePort: jest.Mocked<ICachePort>;

  beforeEach(() => {
    mockUserRepository = {
      list: jest.fn(),
      // ... other mocks
    };

    mockCachePort = {
      get: jest.fn(),
      set: jest.fn(),
      // ... other mocks
    };

    useCase = new ListUsersUseCase(mockUserRepository, mockCachePort);
  });

  it('should return cached result if available', async () => {
    const filter = { page: 1, limit: 10 };
    const cachedResult = { data: [], total: 0 };
    
    mockCachePort.get.mockResolvedValue(cachedResult);

    const result = await useCase.execute(filter);

    expect(result).toEqual(cachedResult);
    expect(mockUserRepository.list).not.toHaveBeenCalled();
  });

  it('should fetch from DB if cache miss', async () => {
    const filter = { page: 1, limit: 10 };
    const dbResult = { data: [...], total: 100 };

    mockCachePort.get.mockResolvedValue(null);
    mockUserRepository.list.mockResolvedValue(dbResult);

    const result = await useCase.execute(filter);

    expect(result).toEqual(dbResult);
    expect(mockCachePort.set).toHaveBeenCalled();
  });
});
```

### Integration Tests

Test full flow with real services:

```bash
npm run test:e2e -- users
```

---

## ✅ Verification Checklist

After completing all phases, verify:

- [ ] All use-cases follow dependency injection pattern
- [ ] All adapters implement port interfaces
- [ ] No direct DB access in use-cases (always via repository port)
- [ ] Presenters format all responses consistently
- [ ] DTOs have class-validator decorators
- [ ] Error handling uses domain-aware exceptions
- [ ] Kafka events don't contain sensitive data (tokens, passwords)
- [ ] Redis caching has proper TTL and invalidation strategy
- [ ] Module exports are clean (only controllers and public use-cases)
- [ ] Build runs with 0 errors: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] No unused imports or dead code

---

## 🚀 Deployment Readiness

Before deploying to staging:

1. **Build**
   ```bash
   npm run build
   ```

2. **Run Tests**
   ```bash
   npm test
   npm run test:e2e
   ```

3. **Check Coverage**
   ```bash
   npm test -- --coverage
   ```

4. **Lint**
   ```bash
   npm run lint -- --max-warnings=0
   ```

5. **Code Review**
   - Verify Clean Architecture layers are respected
   - Check SOLID principles applied
   - Review error handling patterns

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  Controllers (HTTP) + GraphQL Resolvers + Presenters        │
└──────────────────────┬──────────────────────────────────────┘
                       │ (DTOs)
┌──────────────────────▼──────────────────────────────────────┐
│                  Application Layer                           │
│  Use-Cases (Business Logic) + Ports (Interfaces)            │
│  - ListUsersUseCase, CreateUserUseCase, ...                 │
│  - IUserRepository, IKeycloakUserPort, IKafkaPort, ...      │
└──────────────────────┬──────────────────────────────────────┘
                       │ (Depends on)
┌──────────────────────▼──────────────────────────────────────┐
│               Infrastructure Layer                           │
│  Adapters (Implementations) + External Services             │
│  - UserPrismaRepository, KeycloakUserAdapter                │
│  - RedisCacheAdapter, KafkaUserEventsAdapter                │
└──────────────────────┬──────────────────────────────────────┘
                       │ (Uses)
┌──────────────────────▼──────────────────────────────────────┐
│                    Domain Layer                              │
│  Entities + Value Objects + Domain Events                   │
│  - User (Aggregate Root), Group (Entity)                    │
│  - Role (Value Object)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Files Reference

### Key Files to Review

- [AUTH_REFACTOR_COMPLETE.md](./AUTH_REFACTOR_COMPLETE.md) - Auth module reference (apply same pattern)
- [CLEAN_ARCHITECTURE_GUIDE.md](./CLEAN_ARCHITECTURE_GUIDE.md) - Architecture explanation
- [src/modules/auth/auth.module.ts](./src/modules/auth/auth.module.ts) - DI wiring reference
- [src/modules/auth/application/use-cases/login.use-case.ts](./src/modules/auth/application/use-cases/login.use-case.ts) - Use-case template

### Deliverables

- ✅ Updated User entity (constructor fixed)
- ✅ Auth module (complete & tested)
- 🔄 Users application/ports (need to create)
- 🔄 Users infrastructure adapters (need to create/update)
- 🔄 Users presenters (need to create)
- 🔄 Users module DI wiring (need to update)
- 🔄 Unit tests for users use-cases (need to create)

---

**Next Step**: Start with Phase 1 (Create Application Ports), then proceed sequentially through Phases 2-5.

For questions, refer to the auth module implementation as reference.

---

**Status**: 🟢 Ready for Phase 1  
**Last Updated**: February 3, 2026
