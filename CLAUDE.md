# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Install all dependencies
npm install

# Build all packages and services
npm run build

# Type check all packages and services (faster than full build)
npm run build:check

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run lint on all files
npm run lint

# Fix lint issues
npm run lint:fix

# Format all files with prettier
npm run format

# Run tests for a single module (example)
npm run test -- workspace=packages/contract test -- run
npm run test -- services/system-auth-service -- run
```

## Architecture

This is a **monorepo** using npm workspaces for a modular enterprise data platform SDK following **contract-first DDD** principles.

### Directory Structure

- **`packages/`** - Core libraries published as npm packages
  - `contract/` - All interface contracts and DTO definitions for 16 bounded contexts. This is the single source of truth for all APIs.
  - `sdk/` - HTTP client SDK for consuming the services
  - `shared/` - Shared utilities and base types used across all modules
  - `database/` - Shared Prisma schema and client singleton for all services

- **`services/`** - NestJS microservice implementations (one per bounded context)
  - Each service is independently deployable
  - Each service follows the same structure: `src/{module}/` with modules, controllers, services, entities
  - Current services: `data-service-service`, `metadata-service`, `system-auth-service` (in progress)

- **`doc/`** - Design documents and specifications
  - `doc/design/` - SDK design and component selections
  - `doc/services/` - Service-specific development plans
  - `docs/superpowers/plans/` - Implementation plans for agents

### Key Design Principles

1. **Contract First**: All interfaces are defined in `@ai-datahub/contract` before implementation. Services implement the contract interfaces.
2. **Modular**: Each bounded context is a separate service/package. Dependencies are explicit.
3. **TypeScript Strict**: Strict mode enabled everywhere, no `any` type escapes.
4. **DDD**: Each module aligns with a business bounded context.

### Technology Stack

- Language: TypeScript 5.x (strict mode)
- Runtime: Node.js 18+
- Build: tsup (esbuild-based)
- Test: Vitest
- Backend Services: NestJS + Fastify
- ORM: Prisma
- Database (MVP): SQLite
- Validation: Zod
- Versioning: changesets

### When Adding a New Service

1. Follow the existing pattern in `services/data-service-service`
2. Copy the configuration files (`package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`)
3. Update names and descriptions
4. Add entities matching the contract definitions
5. Create feature modules following TDD
