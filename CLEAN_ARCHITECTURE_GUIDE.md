# Auth & Users Module Refactoring - Clean Architecture + DDD

## 🎯 Mục Tiêu Refactor

Chuyển từ cấu trúc hiện tại sang **Clean Architecture + DDD + SOLID**:

```
Before (Hiện tại):
auth/
├── application/use-cases/
├── infrastructure/ (pha trộn logic + infra)
├── presentation/
└── config/ (pha trộn logic)

After (Mới):
auth/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── repositories/ (interfaces)
├── application/
│   ├── dtos/
│   ├── use-cases/
│   └── ports/ (contracts)
├── presentation/
│   ├── controllers/
│   ├── presenters/
│   ├── middleware/
│   └── guards/
└── infrastructure/
    ├── keycloak/ (adapter)
    ├── prisma/ (adapter)
    ├── redis/ (adapter)
    ├── kafka/ (adapter)
    ├── security/
    └── workers/
```

---

## 🏗️ Clean Architecture Layers

### 1️⃣ **Domain Layer** (Business Rules - Independent)
```
domain/
├── entities/
│   ├── auth-user.entity.ts    → User data (id, keycloak_id, email, status)
│   ├── auth-session.entity.ts → Session data (sessionId, userId, expiresAt)
│   └── role.entity.ts         → Role data
├── value-objects/             → Immutable, no side effects
├── events/                     → Domain events (UserCreated, LoginEvent)
└── repositories/ (PORTS)       → Contracts (interfaces only!)
    ├── user.repository.port.ts
    └── session.repository.port.ts
```
**Trách nhiệm:** Define business rules, entities, interfaces.  
**Không phụ thuộc vào:** Frameworks, databases, external services.

---

### 2️⃣ **Application Layer** (Use Cases - Orchestration)
```
application/
├── dtos/
│   ├── login.request.dto.ts
│   ├── login.response.dto.ts
│   ├── logout.request.dto.ts
│   └── refresh-token.*.dto.ts
├── use-cases/
│   ├── login.use-case.ts          → Login flow (verify token, create user/session)
│   ├── logout.use-case.ts         → Logout flow (revoke, delete session)
│   ├── refresh-token.use-case.ts  → Token refresh (extend TTL)
│   └── clear-session.use-case.ts  → Clear expired (called by worker)
└── ports/ (CONTRACTS)
    ├── user.repository.port.ts    → Interface for user persistence
    ├── session.repository.port.ts → Interface for session persistence
    ├── keycloak.port.ts           → Interface for Keycloak integration
    ├── kafka.port.ts              → Interface for Kafka events
    └── cache.port.ts              → Interface for Redis cache
```
**Trách nhiệm:** Orchestrate use cases, call ports (not implementations).  
**Không phụ thuộc vào:** Database specifics, external API details.  
**Phụ thuộc vào:** Domain entities, ports (abstractions).

---

### 3️⃣ **Presentation Layer** (HTTP/GraphQL - User Interface)
```
presentation/
├── controllers/
│   └── auth.controller.ts
│       ├── POST /auth/login        → call LoginUseCase
│       ├── POST /auth/logout       → call LogoutUseCase
│       ├── POST /auth/refresh-token→ call RefreshTokenUseCase
│       └── (no business logic here!)
├── presenters/
│   ├── login.presenter.ts  → Format login response
│   └── logout.presenter.ts → Format logout response
├── middleware/
│   └── auth-session.middleware.ts  → Extract session from header
├── guards/
│   └── jwt-auth.guard.ts           → Guard for protected routes
└── graphql/
    └── resolvers/                  → GraphQL resolvers (same principle)
```
**Trách nhiệm:** HTTP/GraphQL interface, request/response formatting.  
**Không phụ thuộc vào:** Business logic details.  
**Phụ thuộc vào:** Use cases, presenters.

---

### 4️⃣ **Infrastructure Layer** (External Services - Adapters)
```
infrastructure/
├── keycloak/
│   ├── keycloak.adapter.ts         → Implements IKeycloakPort
│   │   ├── verifyToken()
│   │   ├── revokeToken()
│   │   └── listUsers()
│   └── keycloak-config.ts
├── prisma/
│   ├── user.prisma.repository.ts   → Implements IUserRepository
│   │   ├── findByKeycloakId()
│   │   ├── create()
│   │   └── update()
│   └── session.prisma.repository.ts → Implements ISessionRepository
│       ├── createSession()
│       └── deleteExpiredSessions()
├── redis/
│   ├── redis-cache.adapter.ts      → Implements ICachePort
│   │   ├── set()
│   │   ├── get()
│   │   └── deletePattern()
│   └── user.redis.cache.ts         → Optional: user-specific cache
├── kafka/
│   ├── kafka.publisher.adapter.ts  → Implements IKafkaPort
│   │   ├── publishLoginEvent()
│   │   └── publishUserCreatedEvent()
│   └── kafka-config.ts
├── security/
│   ├── jwt-verifier.service.ts
│   └── jwks.client.ts
└── workers/
    └── token-revocation.worker.ts  → Background job (cleanup expired sessions)
```
**Trách nhiệm:** Implement ports, interact with external services.  
**Có thể thay đổi dễ dàng:** Keycloak → Auth0, Prisma → MongoDB, Redis → Memcached, Kafka → RabbitMQ.

---

## 🔄 Dependency Injection (DI) Flow

```
Controller
  ↓
LoginUseCase (injected ports)
  ├→ IUserRepository (injected)
  │   └→ UserPrismaRepository (Prisma adapter)
  ├→ ISessionRepository (injected)
  │   └→ SessionPrismaRepository (Prisma adapter)
  ├→ IKeycloakPort (injected)
  │   └→ KeycloakAdapter
  ├→ IKafkaPort (injected)
  │   └→ KafkaPublisherAdapter
  └→ ICachePort (injected)
      └→ RedisCacheAdapter
```

**auth.module.ts:**
```typescript
{
  provide: USER_REPOSITORY,
  useClass: UserPrismaRepository,  // ← Bind interface to implementation
}
```

**Advantage:** Swap `UserPrismaRepository` with `UserMongoRepository` by changing 1 line!

---

## 🔐 Login Flow (60-minute Session TTL)

```
1. Client sends Keycloak token
   POST /auth/login
   { token: "eyJhbGciOi..." }

2. AuthController calls LoginUseCase.execute()

3. LoginUseCase:
   a) IKeycloakPort.verifyToken(token)
      → Extract sub, email, name from JWT
   
   b) IUserRepository.findByKeycloakId(sub)
      → Check if user exists in local DB
   
   c) If NOT exists:
      - IUserRepository.create() → new user in DB
      - IKafkaPort.publishUserCreatedEvent() → log to Kafka
   
   d) If EXISTS but profile changed:
      - IUserRepository.update() → update fields
      - IKafkaPort.publishUserUpdatedEvent() → log to Kafka
   
   e) Create session object:
      - sessionId = UUID
      - userId = from DB
      - expiresAt = now + 3600 seconds
   
   f) Store session:
      - ISessionRepository.createSession() → Prisma (audit)
      - ICachePort.set("session:{id}", data, 3600) → Redis
   
   g) IKafkaPort.publishLoginEvent() → log login

4. Return LoginResponseDTO
   {
     sessionId, userId, email, username,
     accessToken, expiresAt, expiresIn
   }

5. Background Worker (every 5 min):
   - Query expired sessions from Prisma
   - For each: call ClearSessionUseCase
     a) IKeycloakPort.revokeToken()
     b) ISessionRepository.deleteSession()
     c) ICachePort.delete("session:{id}")
     d) IKafkaPort.publishLogoutEvent()
```

---

## 📊 SOLID Principles Applied

### 1. **S - Single Responsibility**
```
❌ Before:
class LoginService {
  login() { ... }      // Use case
  verifyToken() { ... }// Keycloak logic
  saveSession() { ... }// Database logic
  publishEvent() { ... }// Kafka logic
}

✅ After:
LoginUseCase // Orchestrate only
KeycloakAdapter // Keycloak only
UserPrismaRepository // User DB only
SessionPrismaRepository // Session DB only
KafkaPublisherAdapter // Kafka only
```

### 2. **O - Open/Closed**
```
✅ Open for extension (new adapters):
- Add RedisSessionRepository implementing ISessionRepository
- Add Auth0Adapter implementing IKeycloakPort
- Add RabbitMQAdapter implementing IKafkaPort

❌ Closed for modification:
- LoginUseCase doesn't change
- Domain entities don't change
```

### 3. **L - Liskov Substitution**
```
✅ Any IUserRepository implementation can replace another:
- UserPrismaRepository
- UserMongoRepository
- UserInMemoryRepository (for tests)

All are interchangeable!
```

### 4. **I - Interface Segregation**
```
✅ Small, focused interfaces:
IUserRepository { findById, findByKeycloakId, create, update, list }
ISessionRepository { createSession, deleteSession, getSession }
IKeycloakPort { verifyToken, revokeToken, getUser }

❌ Big monolithic interface (avoid):
IAuthService { ... 20 methods ... }
```

### 5. **D - Dependency Inversion**
```
❌ High-level depends on low-level:
LoginUseCase → KeycloakService (concrete)
LoginUseCase → PrismaService (concrete)

✅ Both depend on abstractions:
LoginUseCase → IKeycloakPort (abstraction)
LoginUseCase → IUserRepository (abstraction)
KeycloakAdapter → IKeycloakPort (implements)
UserPrismaRepository → IUserRepository (implements)
```

---

## 🔑 Key Files & Their Roles

| File | Role | Layer |
|------|------|-------|
| `domain/entities/auth-user.entity.ts` | Define user business rules | Domain |
| `application/ports/user.repository.port.ts` | Contract for user persistence | Application |
| `application/use-cases/login.use-case.ts` | Orchestrate login flow | Application |
| `infrastructure/keycloak/keycloak.adapter.ts` | Implement Keycloak integration | Infrastructure |
| `infrastructure/prisma/user.prisma.repository.ts` | Implement user persistence | Infrastructure |
| `presentation/controllers/auth.controller.ts` | HTTP endpoints | Presentation |
| `auth.module.ts` | Wire DI bindings | DI Container |

---

## 🚀 CI/CD Pipeline

```
.github/workflows/
├── ci.yml          ← Lint, test, build (on PR)
├── cd.yml          ← Build image, push, deploy (on main push)
└── security.yml    ← CodeQL, Dependabot (scheduled)

CI Steps:
1. Lint (ESLint) → fail if --max-warnings exceeded
2. Test (Jest) → fail if coverage <80%
3. Build (tsc) → fail if compile error
4. Audit (npm audit) → fail if critical vulnerabilities
5. Quality gate → all must pass

CD Steps:
1. Build Docker image (multi-stage)
2. Push to GHCR
3. Security scan (Trivy)
4. Run prisma migrate deploy
5. Deploy to k8s (kubectl)
6. Wait for rollout
7. Smoke tests
```

---

## 📈 Monitoring & Metrics

**Prometheus metrics to track:**
```
auth_login_total{status="success|fail"}      # Counter
auth_login_duration_seconds                  # Histogram
session_active_count                         # Gauge
session_expired_total                        # Counter
keycloak_token_revoke_failures_total         # Counter
redis_cache_hit_rate                         # Gauge
kafka_events_published_total                 # Counter
```

**Alerts:**
```
- High login failure rate (>10% in 5 min)
- Session creation latency p99 > 500ms
- Redis connection pool exhaustion
- Kafka producer lag > 1 min
```

---

## ✅ Checklist Before Going Live

- [ ] All tests pass locally
- [ ] ESLint passes with 0 warnings
- [ ] npm audit passes (no critical)
- [ ] Code coverage > 80%
- [ ] Docker image builds & runs
- [ ] Keycloak connection tested
- [ ] Redis connection tested
- [ ] Kafka connection tested
- [ ] Database migrations tested on staging
- [ ] Session expiry tested (after 60 min)
- [ ] Login/logout/refresh-token flows tested
- [ ] Profile update synced from Keycloak
- [ ] Kafka events published correctly
- [ ] Monitoring & alerts setup
- [ ] Rollback plan ready
- [ ] Documentation complete

---

## 📚 References

- **Architecture:** https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **DDD:** https://www.domainlanguage.com/ddd/
- **SOLID:** https://en.wikipedia.org/wiki/SOLID
- **NestJS:** https://docs.nestjs.com/
- **Keycloak:** https://www.keycloak.org/docs/
- **Prisma:** https://www.prisma.io/docs/
- **Redis:** https://redis.io/docs/
- **Kafka:** https://kafka.apache.org/documentation/

---

## 🤝 Contributing

When adding new features:
1. Define domain entities & value-objects first
2. Define ports (interfaces) in `application/ports/`
3. Implement use-cases in `application/use-cases/`
4. Implement adapters in `infrastructure/`
5. Add controllers/resolvers in `presentation/`
6. Write tests (ports mocked, adapters real)
7. Update auth.module.ts DI bindings

**DO NOT:**
- ❌ Put business logic in controllers
- ❌ Hardcode external service URLs in use-cases
- ❌ Use concrete implementations in use-cases (always use ports)
- ❌ Log tokens or passwords
- ❌ Skip tests

---

## Q&A

**Q: Why separate IUserRepository in both domain/repositories and application/ports?**  
A: Domain has empty interface (contracts), Application has implementation details. Separate concerns.

**Q: Can I use a different database than Prisma?**  
A: Yes! Implement IUserRepository + ISessionRepository using MongoDB, DynamoDB, etc.

**Q: How do I test use-cases?**  
A: Mock all ports using jest.fn(). No real DB/Keycloak/Redis needed.

**Q: What if Keycloak is down?**  
A: LoginUseCase throws error, controller catches it, returns HTTP 500. Graceful degradation.

**Q: How to handle concurrent sessions for same user?**  
A: Store multiple sessionIds in Redis `user_sessions:{userId}` (list). On logout, remove one; on ClearSession, can remove all old ones if needed.
