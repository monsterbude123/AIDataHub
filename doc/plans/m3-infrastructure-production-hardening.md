# M3 Infrastructure Production Hardening

## Scope

- DB config is selected by `APP_ENV` and `DATABASE_URL_DEV/STAGE/PROD`.
- Cache backend is selected by `CACHE_BACKEND` (or defaults by env), with Redis preferred in prod.
- Event bus backend is selected by `EVENT_BUS_BACKEND` (or defaults by env), with RabbitMQ preferred in prod.
- CI and smoke use the same infra set: PostgreSQL + Redis + RabbitMQ.

## Environment Configuration

### Local dev (recommended)

```bash
APP_ENV=dev
DATABASE_URL_DEV=postgresql://postgres:postgres@localhost:5432/aidatahub?schema=public
DATABASE_URL_STAGE=postgresql://postgres:postgres@localhost:5432/aidatahub_stage?schema=public
DATABASE_URL_PROD=postgresql://postgres:postgres@localhost:5432/aidatahub?schema=public

REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_BACKEND=memory

RABBITMQ_URL=amqp://guest:guest@localhost:5672
EVENT_BUS_BACKEND=memory
```

### Stage / prod (example)

```bash
APP_ENV=prod
DATABASE_URL_DEV=postgresql://db-dev.internal:5432/aidatahub_dev?schema=public
DATABASE_URL_STAGE=postgresql://db-stage.internal:5432/aidatahub_stage?schema=public
DATABASE_URL_PROD=postgresql://db-prod.internal:5432/aidatahub?schema=public

REDIS_HOST=redis.internal
REDIS_PORT=6379
CACHE_BACKEND=redis

RABBITMQ_URL=amqp://mq-user:mq-pass@rabbitmq.internal:5672
EVENT_BUS_BACKEND=rabbitmq
EVENT_BUS_EXCHANGE=aidatahub.events
```

## Runtime Selection Rules

- `getDatabaseUrl()` -> reads `APP_ENV`, then resolves `DATABASE_URL_${APP_ENV.toUpperCase()}`.
- `createCacheFromEnv()`:
  - default `memory` in `dev/stage`
  - default `redis` in `prod`
  - fallback to memory on bootstrap/connect failure with error log
- `createEventBusFromEnv()`:
  - default `memory` in `dev/stage`
  - default `rabbitmq` in `prod`
  - fallback to in-memory on bootstrap failure with error log

## Docker / CI

- `docker-compose.yml` and `docker-compose.full.yml` include `rabbitmq:3-management`.
- `.github/workflows/ci.yml` starts PostgreSQL + Redis + RabbitMQ services.
- CI runs:
  - `db:migrate:deploy`
  - `db:generate`
  - full test/build pipeline
  - `npm run smoke`

## Smoke Validation

`scripts/smoke.mjs` now performs:

1. wait for PostgreSQL
2. wait for Redis (TCP)
3. wait for RabbitMQ (TCP)
4. run Prisma migrate deploy
5. check all `/health` endpoints
6. run critical metadata flow: create source + list sources

## Failure Modes and Degrade Strategy

- Redis unavailable:
  - cache factory logs structured error
  - fallback to in-memory cache
- RabbitMQ unavailable:
  - event bus factory logs structured error
  - fallback to in-memory event bus
- Database URL misconfigured:
  - startup fails fast via `getEnvOrThrow`, no silent fallback
