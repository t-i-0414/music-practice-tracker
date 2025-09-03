# Repository Guidelines

## Project Structure & Module Organization

- Monorepo managed by workspaces. Source lives under `packages/`.
- Apps: `packages/apps/backend` (NestJS + Prisma), `packages/apps/admin` (Next.js), `packages/apps/mobile` (Expo/React Native).
- Shared libs: `packages/libs/eslint-configs`, `packages/libs/eslint-plugins`, `packages/libs/tsconfig-base`.
- Tests are colocated per app under `tests/` (unit/integration/e2e). Backend schemas in `packages/apps/backend/prisma/`.

## Build, Test, and Development Commands

- Setup (installs, links envs, prepares tools): `make setup` (root).
- Quality check (format, spell, lint, types): `bun run quality:check` (root). Auto-fix: `bun run quality:fix`.
- Backend: `cd packages/apps/backend`
  - Dev: `bun run start:dev` (requires DB). Start DB: `make docker-compose-up`.
  - Build/Prod: `bun run build` then `bun run start:prod`.
  - Prisma: `bun run prisma:generate`, `bun run prisma:migrate:deploy`.
- Admin (Next.js): `cd packages/apps/admin`; Dev: `bun run start:dev`; Build: `bun run build`.
- Mobile (Expo): `cd packages/apps/mobile`; Dev: `bun run start:dev` (or `:ios`/`:android`/`:web`).

## Coding Style & Naming Conventions

- Language: TypeScript across apps. Use workspace configs: `@music-practice-tracker/eslint-configs`.
- Formatting: Prettier (120 char width, single quotes). Check: `bun run format:check`; Fix: `bun run format:fix`.
- Linting: `bun run lint:es:check` (root or per package). Keep filenames kebab-case; React components PascalCase.

## Testing Guidelines

- Backend (Jest): `bun run test`, with `test:unit`, `test:integration`, `test:e2e`, `test:cov`.
- Admin: Unit (Vitest) `bun run test:unit`; Integration (Cypress) `bun run test:integration`; E2E (Playwright) `bun run test:e2e`.
- Mobile: Unit (Jest) `bun run test:unit`; E2E (Maestro) from package: `make test-e2e` (dev server must be running).

## Commit & Pull Request Guidelines

- Conventional Commits enforced by commitlint. Allowed scopes: `backend`, `mobile`, `admin`, `eslint-configs`, `eslint-plugins`, `tsconfig-base`.
  - Example: `feat(backend): add practice session API`.
- PRs: include clear description, linked issues, and screenshots for UI changes. Ensure CI passes, update docs if behavior changes.

## Security & Configuration Tips

- Environment: copy `./.env.example` to `./.env` or run `make setup`. Apps symlink to root `.env`.
- Secrets/Env lint: `bun run lint:secret:check`, `bun run lint:dotenv:check` and `:fix`. Prisma models are validated on commit.

## Agent Guidelines (UltraThink + Context7)

These notes guide coding agents (e.g., Serena/Codex CLI) working in this repo.

### UltraThink Defaults

- Plan first: update the task plan with concise steps using the plan tool, keep exactly one step `in_progress`.
- Preambles: before running tools/commands, post a 1–2 sentence preamble describing the immediate next action.
- File access: prefer `rg` for search; read files in ≤250 line chunks; keep patches minimal and focused.
- Patching: use `apply_patch`; do not change unrelated code; follow repo formatting/lint rules.
- Validation: when appropriate, run available tests/linters for the package you touched (see commands above).

### Use Context7 for Documentation

When you need external library/framework documentation, use Context7 — not ad‑hoc web searches.

1. Resolve library ID
   - Call `context7__resolve-library-id` with a clear library name.
   - Use the returned Context7‑compatible ID with `context7__get-library-docs`.

2. Fetch focused docs
   - Call `context7__get-library-docs` with the resolved ID.
   - Optionally set `topic` to narrow (e.g., "routing", "prisma-migrate").

3. Apply with care
   - Prefer primary, official docs retrieved via Context7.
   - Summarize essentials and cite the doc URL in PR descriptions when relevant.
   - Avoid long verbatim quotes; paraphrase and link.

Common libraries in this repo you may resolve via Context7 (examples, not hard‑coded IDs):

- Next.js (admin app): resolve "next.js"; topics: `app-router`, `config`.
- NestJS (backend): resolve "nestjs"; topics: `modules`, `providers`, `pipes`.
- Prisma (backend): resolve "prisma"; topics: `schema`, `migrate`, `client`.
- Expo/React Native (mobile): resolve "expo" and "react-native"; topics: `eas`, `expo-router`.
- Testing: "jest", "vitest", "cypress", "playwright", "maestro".

### Do/Don't

- Do keep messages concise and actionable; include absolute dates when clarifying time-sensitive info.
- Do align commits with Conventional Commits using allowed scopes.
- Don't introduce new tools/frameworks without discussion.
- Don't leak or echo secrets; run env/secret linters as needed.

### Quick Examples

- Need Prisma migrate details: resolve "prisma" → get docs with topic `migrate` → implement minimal change → run `bun run prisma:migrate:deploy` if part of the task.
- Unsure about Next.js config: resolve "next.js" → get docs with topic `config` → update `packages/apps/admin` accordingly → run `bun run build` (admin).

### Operational Checklist

- Scope: confirm task boundaries; create a concise plan (5–7 short steps, exactly one `in_progress`).
- Preamble: before each tool/command, post a 1–2 sentence next‑action note.
- Search: prefer `rg`/`rg --files`; read files in ≤250 line chunks.
- Patch: use `apply_patch`; keep diffs minimal; follow formatting and lint rules.
- Validate: run checks only for the package you changed.
  - Root: `bun run quality:check` (or `quality:fix` if explicitly fixing).
  - Backend: `bun run test` / `test:unit` / `test:e2e`.
  - Admin: `bun run test:unit` / `test:integration` / `test:e2e`.
  - Mobile: `bun run test:unit`; Maestro E2E requires running dev server.
- Env/Secrets: if editing env, run `bun run lint:secret:check` and `bun run lint:dotenv:check`.
- Commits/PRs: Conventional Commits with allowed scopes; PR includes summary, risks, rollback, and UI screenshots where applicable.

### Preamble Templates

Use short, friendly, next‑step focused lines.

`I’ve scanned the repo; now checking backend route wiring.`

`Next, I’ll patch the config and update related tests.`

`About to resolve Prisma docs via Context7 and confirm migrate steps.`

### Plan Templates

Example step lists (edit as needed):

- Add API endpoint skeleton
- Wire service and repository
- Validate DTO and guards
- Add unit/integration tests
- Update docs and examples

- Define DB schema change
- Generate Prisma client
- Implement data access layer
- Cover with tests
- Run migrate deploy

### Context7 Topic Presets by App

- Backend (NestJS + Prisma):
  - Libraries: `nestjs`, `prisma`.
  - Topics: `modules`, `providers`, `pipes`, `class-validator`, `schema`, `migrate`, `client`.

- Admin (Next.js):
  - Libraries: `next.js`.
  - Topics: `app-router`, `data-fetching`, `config`, `middleware`, `image-optimization`, `env`.

- Mobile (Expo/React Native):
  - Libraries: `expo`, `react-native`.
  - Topics: `expo-router`, `dev-client`, `eas-build`, `permissions`, `linking`.

- Testing:
  - Libraries: `jest`, `vitest`, `cypress`, `playwright`, `maestro`.
  - Topics: `configuration`, `fixtures`, `parallel`, `ci`.

Context7 usage pattern:

1. `context7__resolve-library-id` with a clear `libraryName` (e.g., "prisma").
2. `context7__get-library-docs` using the resolved ID; set `topic` when helpful (e.g., `migrate`).
3. Apply changes; paraphrase insights and, in PRs, reference the doc source.
