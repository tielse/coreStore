# Quick Start - Refactoring Auth Module

## ⚡ 5-Minute Overview

### What Changed?
```
BEFORE: Business logic scattered across services
AFTER:  Clear separation: Domain → Application → Presentation → Infrastructure
```

### Key Files to Read (in order)
1. **REFACTORING_SUMMARY.md** - What files were created
2. **CLEAN_ARCHITECTURE_GUIDE.md** - Why this architecture
3. **REFACTOR_GUIDE.md** - Migration checklist + deployment

---

## 🎯 What to Do Now

### Option 1: Just Review (30 min)
```bash
# Read the architecture
cat CLEAN_ARCHITECTURE_GUIDE.md

# See the login flow
cat src/modules/auth/application/use-cases/login.use-case-refactored.ts

# Check the module wiring
cat src/modules/auth/auth.module-refactored.ts
```

### Option 2: Integrate into Project (2-4 hours)
```bash
# 1. Backup current auth module
cp -r src/modules/auth src/modules/auth.backup

# 2. Copy new adapters into place
cp src/modules/auth/infrastructure/keycloak/keycloak.adapter.ts src/modules/auth/infrastructure/keycloak/
cp src/modules/auth/infrastructure/redis/redis-cache.adapter.ts src/modules/auth/infrastructure/redis/
cp src/modules/auth/infrastructure/kafka/kafka.publisher.adapter.ts src/modules/auth/infrastructure/kafka/
# ... (copy other adapters)

# 3. Replace old auth module with refactored one
# Edit: src/modules/auth/auth.module.ts
# Replace with content from: src/modules/auth/auth.module-refactored.ts

# 4. Update imports in controllers
# Old: import { RedisService } from 'redis'
# New: import { ICachePort, CACHE_PORT } from './application/ports'

# 5. Run tests
npm run test

# 6. Build
npm run build
```

### Option 3: Gradual Migration (Per Feature)
```bash
# Keep existing code, add new adapters side-by-side
# Migrate one endpoint at a time:
# 1. Create new use-case
# 2. Create adapter for it
# 3. Update controller endpoint
# 4. Test
# 5. Move to next endpoint
```

---

## 📂 New File Structure

```
✅ CREATED - 25+ new files

Domain Layer:
- domain/value-objects/     (folder created)
- domain/events/            (folder created)

Application Layer:
- application/ports/        (5 ports: User, Session, Keycloak, Kafka, Cache)
- application/use-cases/    (4 refactored use-cases)
- application/dtos/         (DTOs updated)

Presentation Layer:
- presentation/presenters/  (LoginPresenter, LogoutPresenter)
- presentation/guards/      (folder created)
- presentation/middleware/  (folder created)

Infrastructure Layer:
- infrastructure/keycloak/keycloak.adapter.ts
- infrastructure/redis/redis-cache.adapter.ts
- infrastructure/kafka/kafka.publisher.adapter.ts
- infrastructure/prisma/user.prisma.repository.ts
- infrastructure/prisma/session.prisma.repository.ts
- infrastructure/workers/token-revocation.worker.ts

CI/CD:
- .github/workflows/ci.yml
- .github/workflows/cd.yml
- .github/workflows/security.yml
- Dockerfile (multi-stage)

Documentation:
- CLEAN_ARCHITECTURE_GUIDE.md
- REFACTOR_GUIDE.md
- REFACTORING_SUMMARY.md (this is the checklist)
```

---

## 🔌 DI Wiring Example

### Before:
```typescript
// auth.module.ts (old)
providers: [
  LoginUseCase,
  RedisSessionService,
  AuthService,
]
```

### After:
```typescript
// auth.module.ts (new)
providers: [
  LoginUseCase,
  {
    provide: KEYCLOAK_PORT,
    useClass: KeycloakAdapter,       // ← Easy to swap!
  },
  {
    provide: USER_REPOSITORY,
    useClass: UserPrismaRepository,  // ← Easy to swap!
  },
]
```

---

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Run auth tests only
npm run test -- src/modules/auth

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

**Expected results:**
- ✅ LoginUseCase tests pass (first-time login, existing user, profile changes)
- ✅ DTOs validate correctly
- ✅ Adapters handle errors gracefully

---

## 🚀 CI/CD Workflows

### ci.yml (on PR / push)
```
Lint → Test → Build → Security Scan
```

### cd.yml (on main push)
```
Build Docker → Push to Registry → Deploy to k8s → Smoke Tests
```

### security.yml (scheduled)
```
CodeQL → Dependency Check → Trivy Scan
```

---

## 📝 Session Flow (60 minutes)

```
User Login (POST /auth/login)
     ↓
Verify Token (Keycloak)
     ↓
Check Local User
     ↓
├─ First time? → Create user in DB
├─ Profile changed? → Update user
└─ Publish event (Kafka)
     ↓
Create Session
     ├─ Store in Prisma (persistent)
     └─ Store in Redis TTL=3600s (cache)
     ↓
Return sessionId + token
     ↓
(every 5 minutes)
     ↓
Worker: Check expired sessions
     ↓
├─ Revoke token (Keycloak)
├─ Delete session (DB + Redis)
└─ Publish logout event (Kafka)
```

---

## 🔑 Environment Variables

```bash
# Keycloak
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=my-app
KEYCLOAK_CLIENT_SECRET=secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/corestore

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# App
NODE_ENV=development
PORT=3000
```

---

## ✅ Pre-Deployment Checklist

```bash
# 1. Code Quality
npm run lint -- --max-warnings=0
npm run test -- --ci
npm run build

# 2. Security
npm audit
npm run test -- --coverage

# 3. Docker
docker build -t platform-backend:test .
docker run --rm platform-backend:test node -v

# 4. Database Migrations
npx prisma migrate status
npx prisma migrate deploy --skip-generate

# 5. Integration Test
npm run test:integration

# 6. Deploy to Staging
kubectl apply -f k8s/staging/
kubectl rollout status deployment/platform-backend -n staging
```

---

## 🆘 Troubleshooting

### "Module not found: keycloak.adapter"
→ Check file exists at: `src/modules/auth/infrastructure/keycloak/keycloak.adapter.ts`

### "KEYCLOAK_PORT is not a provider"
→ Add to auth.module.ts:
```typescript
{ provide: KEYCLOAK_PORT, useClass: KeycloakAdapter }
```

### Tests fail: "Cannot find IUserRepository"
→ Mock correctly:
```typescript
const mockRepo = { findById: jest.fn(), ... };
{ provide: USER_REPOSITORY, useValue: mockRepo }
```

### Build fails: "Cannot find module redis-cache.adapter"
→ Run: `npm install` (fresh dependencies)

---

## 📊 Metrics to Monitor

```
auth_login_total                  # Counter
auth_login_failed_total           # Counter
auth_login_duration_seconds       # Histogram (p99 < 500ms)
session_active_count              # Gauge
session_expired_total             # Counter
keycloak_token_revoke_failures    # Counter
```

---

## 🎓 Learning Resources

**If you're new to Clean Architecture:**
1. Read: [Clean Code - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
2. Read: [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
3. Watch: [NestJS Best Practices](https://docs.nestjs.com/)

**Quick Recap:**
- **Domain:** Business rules (immutable)
- **Application:** Use cases (orchestration)
- **Presentation:** HTTP/GraphQL
- **Infrastructure:** Adapters (Keycloak, Redis, Kafka)

---

## 🚦 Go-Live Checklist

- [ ] All tests passing locally
- [ ] ESLint 0 warnings
- [ ] Build succeeds
- [ ] Docker image builds
- [ ] Staging deployment successful
- [ ] Login/logout flows tested
- [ ] Session expiry tested (after 60 min)
- [ ] Kafka events published
- [ ] Metrics & alerts setup
- [ ] Rollback plan ready
- [ ] Documentation reviewed

---

## 📞 Next Steps

1. **Read CLEAN_ARCHITECTURE_GUIDE.md** (15 min)
2. **Review auth.module-refactored.ts** (10 min)
3. **Check login.use-case-refactored.ts** (20 min)
4. **Run: npm run test -- login.use-case.spec.ts** (5 min)
5. **Decide:** Integrate now or gradual migration?
6. **Plan deployment** with your team

---

**Questions?** Check CLEAN_ARCHITECTURE_GUIDE.md or REFACTOR_GUIDE.md

**Ready?** Run: `npm run lint && npm run test && npm run build`

🚀 Let's go!
