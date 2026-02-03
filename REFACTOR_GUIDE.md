# Auth & Users Module Refactor - Migration & Deployment Guide

## Overview
Refactoring `auth` và `users` modules theo Clean Architecture + DDD + SOLID principles.

**Lợi ích chính:**
- ✅ Tách rõ ràng Domain/Application/Presentation/Infrastructure
- ✅ Dễ test (các adapters có thể mock)
- ✅ Dễ swap infra (Keycloak → khác)
- ✅ Tuân SOLID (Single Responsibility, Dependency Inversion, etc.)
- ✅ Session management tự động (60 phút → clear token + revoke)
- ✅ Events publish tới Kafka (audit logs)
- ✅ Redis cache cho session + users

---

## Key Components

### 1. **Ports (Contracts)**
```
application/ports/
├── user.repository.port.ts        # IUserRepository
├── session.repository.port.ts      # ISessionRepository
├── keycloak.port.ts                # IKeycloakPort
├── kafka.port.ts                   # IKafkaPort
└── cache.port.ts                   # ICachePort
```

### 2. **Adapters (Implementations)**
```
infrastructure/
├── keycloak/keycloak.adapter.ts           # Keycloak integration
├── redis/redis-cache.adapter.ts           # Redis cache
├── kafka/kafka.publisher.adapter.ts       # Kafka publisher
├── prisma/
│   ├── user.prisma.repository.ts          # User persistence
│   └── session.prisma.repository.ts       # Session persistence
└── workers/token-revocation.worker.ts     # Background jobs
```

### 3. **Use Cases (Business Logic)**
```
application/use-cases/
├── login.use-case-refactored.ts       # Login flow
├── logout.use-case-refactored.ts      # Logout flow
├── refresh-token.use-case-refactored.ts  # Token refresh
└── clear-session.use-case.ts          # Clear expired sessions
```

### 4. **Controllers (Presentation)**
```
presentation/
├── controllers/auth.controller-refactored.ts  # HTTP endpoints
├── presenters/
│   ├── login.presenter.ts      # Format login response
│   └── logout.presenter.ts     # Format logout response
└── middleware/                 # Auth middleware
```

---

## Login Flow (60-minute session)

### Step 1: User sends Keycloak token → /auth/login
```
POST /auth/login
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Step 2: LoginUseCase executes:
```
1. Verify token via IKeycloakPort.verifyToken()
2. Extract keycloak ID (sub), email, name
3. Check local DB via IUserRepository.findByKeycloakId()
4. If first-time:
   - Create user in DB
   - Publish "user.created" event to Kafka
5. If existing but profile changed:
   - Update user in DB
   - Publish "user.updated" event to Kafka
6. Create session object:
   - sessionId: UUID
   - userId: from DB
   - expiresAt: now + 3600 seconds
7. Store session in:
   - Prisma (persistent for audit)
   - Redis (TTL 3600s for quick access)
8. Publish "auth.login" event to Kafka
9. Return sessionId + accessToken + expiresAt
```

### Step 3: Response
```json
{
  "sessionId": "uuid-xxx",
  "userId": "uuid-yyy",
  "email": "user@example.com",
  "username": "john.doe",
  "fullName": "John Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-02-02T11:30:00Z",
  "expiresIn": 3600
}
```

---

## Session Expiry & Auto-Logout (60 minutes)

### Background Worker: TokenRevocationWorker
```
- Runs every 5 minutes (via @Cron)
- Queries Prisma for sessions where expires_at < now()
- For each expired session:
  1. Call IKeycloakPort.revokeToken()
  2. Delete from Prisma
  3. Delete from Redis
  4. Publish "auth.logout" event to Kafka
- Ensures tokens are revoked even if user doesn't explicitly logout
```

### Alternative: Redis Keyspace Notifications
If Redis is configured with `notify-keyspace-events = "Ex"`:
- Redis automatically fires notification when session key expires
- Listener catches it and calls ClearSessionUseCase
- More real-time but requires Redis config change

---

## Kafka Events Published

### Topic: `auth.events`
```json
{
  "eventType": "auth.login",
  "userId": "uuid",
  "email": "user@example.com",
  "keycloakId": "kc-id",
  "sessionId": "uuid",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/...",
  "timestamp": "2026-02-02T10:30:00Z"
}

{
  "eventType": "auth.logout",
  "userId": "uuid",
  "sessionId": "uuid",
  "timestamp": "2026-02-02T11:30:00Z"
}

{
  "eventType": "user.created",
  "userId": "uuid",
  "email": "user@example.com",
  "keycloakId": "kc-id",
  "username": "john.doe",
  "timestamp": "2026-02-02T10:30:00Z"
}

{
  "eventType": "user.updated",
  "userId": "uuid",
  "changes": { "email": "newemail@example.com", "full_name": "John Smith" },
  "timestamp": "2026-02-02T10:31:00Z"
}
```

### Consumers (to be implemented)
- Logger service: log all events
- Analytics service: track login/logout patterns
- Security service: detect anomalies (multiple logins from different IPs)

---

## Redis Cache Strategy

### Session Cache
```
Key: "session:{sessionId}"
Value: { sessionId, userId, email, expiresAt }
TTL: 3600s (1 hour)

Key: "user_sessions:{userId}"
Value: [sessionId1, sessionId2, ...]
TTL: 3600s
```

### User Cache
```
Key: "user:{userId}"
Value: { id, email, username, full_name, status, ... }
TTL: 600s (10 minutes) or manual invalidation

Key: "users:list:{query_hash}"
Value: [{ user1 }, { user2 }, ...]
TTL: 300s (5 minutes)
```

### Cache Invalidation
- On user update: delete `user:{userId}` and `users:list:*`
- On session create: add to `user_sessions:{userId}`
- On session delete: remove from `user_sessions:{userId}`

---

## Environment Variables

```bash
# Keycloak
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=my-app
KEYCLOAK_CLIENT_SECRET=secret123
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin123

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/core_store

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=platform-backend

# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] Run `npm run lint -- --max-warnings=0` (ESLint passes)
- [ ] Run `npm run test -- --ci --coverage` (all tests pass, >80% coverage)
- [ ] Run `npm audit` (no critical vulnerabilities)
- [ ] Run `npm run build` (build succeeds)

### ✅ Database
- [ ] Ensure `prisma/schema.prisma` includes `sys_user` and `sys_user_session` tables
- [ ] Run `npx prisma migrate deploy` on staging
- [ ] Verify tables are created and migrations are recorded

### ✅ Configuration
- [ ] Set all environment variables in `.env` or secrets manager
- [ ] Verify Keycloak connection: test token verification
- [ ] Verify Redis connection: test ping + set/get
- [ ] Verify Kafka brokers: test publish/subscribe
- [ ] Verify database connection: test query

### ✅ Integration Tests
- [ ] Test login flow with first-time user
  - POST /auth/login with Keycloak token
  - Verify user created in DB
  - Verify session stored in Redis
  - Verify kafka event published
  - Assert response has sessionId, userId, email

- [ ] Test login flow with existing user
  - POST /auth/login with different Keycloak token
  - Verify user NOT duplicated
  - Verify profile updated if changed
  - Verify kafka event published

- [ ] Test logout flow
  - POST /auth/logout with sessionId
  - Verify session deleted from Redis
  - Verify session marked revoked in DB
  - Verify kafka event published

- [ ] Test token refresh
  - POST /auth/refresh-token with sessionId
  - Verify session TTL extended in Redis
  - Verify new expiresAt returned

- [ ] Test session expiry
  - Create session with TTL
  - Wait (or simulate) TTL expiration
  - Run TokenRevocationWorker.cleanupExpiredSessions()
  - Verify session deleted from Prisma & Redis
  - Verify Keycloak token revoked
  - Verify kafka event published

### ✅ Performance & Load
- [ ] Load test /auth/login endpoint (target: <200ms, no degradation at 100 req/s)
- [ ] Verify Redis connection pooling
- [ ] Verify database connection pooling
- [ ] Check metrics: login rate, failed logins, session expirations

### ✅ Monitoring & Alerting
- [ ] Setup Prometheus metrics for:
  - `auth_login_total` (counter)
  - `auth_login_failed_total` (counter)
  - `auth_login_duration_seconds` (histogram)
  - `session_active_count` (gauge)
  - `session_expired_total` (counter)

- [ ] Setup alerts for:
  - High login failure rate (>10% in 5 min)
  - Session creation latency (p99 > 500ms)
  - Redis connection pool exhaustion
  - Kafka producer lag

- [ ] Setup logs aggregation (ELK, Datadog, etc.)
  - Filter logs by: userId, sessionId, event type
  - Never log tokens or passwords

### ✅ Rollout Strategy
1. Deploy to staging first
2. Run full test suite on staging
3. Smoke tests in production (canary deployment)
4. Gradual rollout (10% → 50% → 100%) using feature flags
5. Monitor metrics and logs
6. Rollback plan ready (previous container image)

---

## Common Issues & Troubleshooting

### Issue: "Invalid token"
**Cause:** Token verification with Keycloak failed
**Fix:**
- Verify Keycloak URL is correct
- Verify token is not expired
- Check Keycloak JWKS endpoint is accessible

### Issue: "Session expired"
**Cause:** Session not found in Redis or Prisma
**Fix:**
- Check Redis connection
- Verify session was created
- Check session TTL not already expired

### Issue: "Kafka producer error"
**Cause:** Kafka broker unreachable
**Fix:**
- Verify Kafka broker is running
- Check network connectivity
- Ensure KAFKA_BROKERS env var is correct

### Issue: "User not created on first login"
**Cause:** Database transaction failed
**Fix:**
- Check database connection
- Verify `sys_user` table exists and has correct schema
- Check for unique constraint violations (keycloak_user_id)

---

## Monitoring Queries (PromQL)

```
# Login success rate (last 5 min)
rate(auth_login_total[5m]) - rate(auth_login_failed_total[5m])

# Active sessions
session_active_count

# Session expiration rate
rate(session_expired_total[5m])

# Login latency (p99)
histogram_quantile(0.99, auth_login_duration_seconds)
```

---

## Rollback Plan

If issues occur in production:
1. **Immediate:** Revert deployment to previous image
   ```bash
   kubectl set image deployment/platform-backend \
     platform-backend=ghcr.io/coreStore/backend:v1.0.0 \
     -n production
   ```

2. **Data:** No data loss expected (Prisma migrations are backward-compatible)

3. **Sessions:** Sessions stored in Redis with TTL will naturally expire

4. **Events:** Events already published to Kafka will remain (can be replayed if needed)

---

## References
- [NestJS Documentation](https://docs.nestjs.com/)
- [Keycloak Admin API](https://www.keycloak.org/docs/latest/server_admin/#admin-console)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Redis Commands](https://redis.io/commands/)
- [Apache Kafka](https://kafka.apache.org/documentation/)
