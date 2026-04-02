# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Dependency Installation

```bash
npm install
```

### Bu ild

```bash
npm run build          # Build all packages and services
npm run build:check    # Type check all packages without building
```

### Testing

```bash
npm run test           # Run all tests across all workspaces
npm run test:watch    # Run tests in watch mode
```

### Linting & Formatting

```bash
npm run lint           # Lint all TypeScript files
npm run lint:fix       # Fix linting issues automatically
npm run format         # Format code with prettier
```

### Versioning & Release (changesets)

```bash
npm run change         # Create a new changeset
npm run version        # Update versions based on changesets
npm run release        # Publish to npm
```

### Run Single Test

```bash
npm -w <package-name> run test       # Test specific package
npm -w <package-name> run test:watch # Test specific package in watch mode
```

## Code Architecture

### Project Structure (Monorepo with npm workspaces)

```
ai-datahub/
├── packages/          # Publishable npm packages
│   ├── contract/     # Shared TypeScript contracts (DTOs, error codes, Result, RequestMeta)
│   ├── sdk/          # Client SDK for HTTP calls (auth, retries, observability)
│   └── shared/       # Node.js shared infrastructure (logger, config, error handling)
├── services/         # NestJS microservice implementations
│   ├── data-service-service/
│   └── metadata-service/
├── doc/              # Documentation and design docs
└── tests/            # Integration and E2E tests
```

### Architectural Principles

1. **Contract First**: All interfaces are defined in `@ai-datahub/contract` before implementation. Consumers can depend only on the contract.
2. **Strict Layering** (enforced):

   ```
   Next.js UI → SDK/BFF → NestJS Services → Data/Compute Infrastructure
   ```

   - UI cannot directly access databases or compute engines
   - Domain rules must live in the service layer (not UI/BFF)
   - `traceId` must be passed end-to-end
   - All writes should support `idempotencyKey`

3. **DDD + Bounded Context**: Each business capability is a separate bounded context:
   - 16 modules total (cost-management, data-governance, data-integration, etc.)
   - Each service maps to one bounded context
   - Modules can evolve independently
4. **TypeScript Strict Mode**: Zero `any`, full type inference everywhere.
5. **Documentation Requirement**: Every microservice **must** include:
   - `README.md` - Service overview, function list, API table, running instructions
   - `<service-name>-sdk-integration.md` - Complete SDK integration guide with usage examples for every API
   - Documentation format must align with `system-auth-service` as the standard template
6. **Dual Output**: All packages ship both ESM and CJS for broad compatibility.

### Agent Rules

This project uses a structured AI agent workflow with GitNexus code intelligence:

**Three Iron Laws**:

1. **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST** — TDD mandatory
2. **NO CODE MODIFICATION WITHOUT GITNEXUS IMPACT ANALYSIS** — Always run `mcp_gitnexus_impact` before editing symbols
3. **NO MODULE WITHOUT DOCUMENTATION** — Documentation must exist before code is complete

**GitNexus Usage**:

- Before editing: `mcp_gitnexus_impact({target: "symbolName", direction: "upstream"})`
- For exploration: `mcp_gitnexus_query({query: "concept"})`
- Before commit: `mcp_gitnexus_detect_changes({scope: "staged"})`
- Keep index fresh: `npx gitnexus analyze` after commits

**Agent Collaboration Flow**:

1. `planner` — Planning & architecture design, creates documentation
2. `tdd-guide` — Enforces red/green/refactor
3. `implementer` — Implements according to plan
4. `reviewer` — Code quality, security, test coverage review
5. `verifier` — Pre-commit validation (build, types, tests, security)
6. `debugger` — Systematic debugging with TDD
7. `doc-updater` — Generates architecture maps and updates documentation

### Key Technology Stack

- **Language**: TypeScript 5.x (strict mode)
- **Runtime**: Node.js 18+
- **Package Manager**: npm (workspaces)
- **Build Tool**: tsup
- **Testing**: Vitest
- **Code Quality**: ESLint + Prettier + husky + lint-staged
- **Versioning**: changesets
- **Validation**: Zod
- **Backend Framework**: NestJS (services)
- **Frontend**: Next.js (planned, not in this repo)

### Design Documents

- `doc/ARCHITECTURE.md` — Full architecture overview
- `doc/DEVELOPMENT-GUIDELINES.md` — Coding standards and development guidelines (must follow)
- `doc/DECISIONS.md` — Architecture decision records (ADR)
- `doc/design/sdk/` — SDK design documentation
- `doc/services/` — Individual service development plans
- `AGENTS.md` — Complete agent system definition

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **AIDataHub** (4066 symbols, 8118 relationships, 18 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/AIDataHub/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool             | When to use                   | Command                                                                 |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `query`          | Find code by concept          | `gitnexus_query({query: "auth validation"})`                            |
| `context`        | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})`                              |
| `impact`         | Blast radius before editing   | `gitnexus_impact({target: "X", direction: "upstream"})`                 |
| `detect_changes` | Pre-commit scope check        | `gitnexus_detect_changes({scope: "staged"})`                            |
| `rename`         | Safe multi-file rename        | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher`         | Custom graph queries          | `gitnexus_cypher({query: "MATCH ..."})`                                 |

## Impact Risk Levels

| Depth | Meaning                               | Action                |
| ----- | ------------------------------------- | --------------------- |
| d=1   | WILL BREAK — direct callers/importers | MUST update these     |
| d=2   | LIKELY AFFECTED — indirect deps       | Should test           |
| d=3   | MAY NEED TESTING — transitive         | Test if critical path |

## Resources

| Resource                                   | Use for                                  |
| ------------------------------------------ | ---------------------------------------- |
| `gitnexus://repo/AIDataHub/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/AIDataHub/clusters`       | All functional areas                     |
| `gitnexus://repo/AIDataHub/processes`      | All execution flows                      |
| `gitnexus://repo/AIDataHub/process/{name}` | Step-by-step execution trace             |

## Self-Check Before Finishing

Before completing any code modification task, verify:

1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
