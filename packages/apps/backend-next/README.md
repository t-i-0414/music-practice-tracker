# @music-practice-tracker/backend-next

> **Status: starter scaffold.** Phase 1 of the rebuild plan
> (`docs: ../../../../../Desktop/work/mpt/rebuild-backend-and-auth/plan.md`).
> This package will eventually replace `packages/apps/backend/`. While both exist,
> `backend-next` is the active development target on the `rebuild/backend-and-auth` branch.

## What is set up

| Concern | Implementation |
|---|---|
| HTTP server | `Bun.serve` at the entry, dispatching `/api/auth/*` to BetterAuth and the rest to `@effect/platform` HttpApi |
| HttpApi | `src/http/api-app/` and `src/http/api-admin/` — schema-first, generates OpenAPI |
| ORM | Drizzle ORM (`drizzle-orm/node-postgres`) provided as `Db` Layer in `src/repository/db.ts` |
| Auth | Two BetterAuth instances (app + admin) in `src/auth/`. App: email/password, Google, Apple, Magic Link, Bearer token. Admin: email/password, Magic Link, admin plugin (impersonation) |
| Logging | `Effect.Logger` backed by pino (`src/observability/logger.ts`) |
| Correlation IDs | `FiberRef`-based, set per request in the `Bun.serve` fetch handler |
| Config | `Effect.Config` (`src/config/env.ts`) — see `.env.example` |
| Migrations | `drizzle-kit` (`drizzle.config.ts`) |

## Running

```bash
# 1. Copy env (don't commit your filled-in copy)
cp .env.example .env

# 2. Install deps from monorepo root
cd ../../.. && bun install

# 3. Generate and apply initial migration
cd packages/apps/backend-next
bun run drizzle:generate
bun run drizzle:migrate

# 4. Start both APIs
bun run start:dev
# → App API:   http://localhost:3000/health
# → Admin API: http://localhost:3001/health
```

## Verifying it works

```bash
curl http://localhost:3000/health
# {"status":"ok","service":"app-api","db":"reachable","timestamp":"..."}

curl http://localhost:3000/docs/openapi.json | head -20
```

BetterAuth endpoints are **not mounted yet** in this starter. The instance is
constructed in `src/apps/{app,admin}-api/main.ts` (exported as `auth`); the
inline comment block describes how to wire it up via `HttpLayerRouter.use`.

## How to extend

### Add a new HTTP endpoint group (e.g. `users`)

1. **Define the API** in `src/http/api-app/users.api.ts`:
   ```ts
   export const UsersGroup = HttpApiGroup.make('users')
     .add(HttpApiEndpoint.get('me', '/users/me').addSuccess(UserSchema));
   ```
2. **Add it to AppApi** in the same file (or in `src/http/api-app/app-api.ts` if you split):
   ```ts
   export class AppApi extends HttpApi.make('AppApi').add(HealthGroup).add(UsersGroup) {}
   ```
3. **Implement the handler** in `src/http/handlers-app/users/users.handler.ts`:
   ```ts
   export const UsersGroupLive = HttpApiBuilder.group(AppApi, 'users', (h) =>
     h.handle('me', () => Effect.succeed({ id: '...', name: '...' })));
   ```
4. **Register** by extending `AppApiLive` to provide both `HealthGroupLive` and `UsersGroupLive`.

### Add a domain aggregate (e.g. `user.aggregate.ts`)

Follow `plan.md §1.2`. Drop new modules under `src/domain/<aggregate>/` with
`*.query.ts` (read), `*.command.ts` (write), `*.dto.ts` (Schema), `*.events.ts`,
`*.errors.ts` (TaggedError). All consumed by handlers via `Context.Tag` + Layer.

### Enable BetterAuth Passkey

```bash
bun run auth:generate
```
Append the generated `passkey` table to `src/repository/schema/app-auth.ts`,
then add `passkey({ rpName: 'Music Practice Tracker', rpID: '...' })` to
`createAppAuth`'s `plugins` array.

### Real Magic Link emails

`src/auth/email.ts` has a stub that logs to the console. Replace with Resend
(suggested) by reading `cfg.resendApiKey` and calling `resend.emails.send`.

## Things deliberately NOT done in this starter

These are tracked in `plan.md §1`:

- [ ] **Mount BetterAuth handlers** at `/api/auth/*` (instances are built; routing
      is the next step — see comment block in `src/apps/app-api/main.ts`)
- [ ] Auth middleware that pushes `CurrentUser` into a FiberRef
- [ ] Domain aggregates (`user`, `admin-user`) ported to Effect-pure form
- [ ] `usecase-user/` (delete-user, update-user, bulk-delete-users)
- [ ] Tagged errors with `ErrorCode` mapping (still in `src/errors/`)
- [ ] OTel exporter (Datadog OTLP) in `src/observability/otel.ts`
- [ ] Vitest config + first round of tests
- [ ] Initial Drizzle migration (`bun run drizzle:generate` after first DB connection)
- [ ] CI workflow updates
- [ ] ESLint rule rewrites for Drizzle (see `eslint.config.ts` note)
- [ ] BetterAuth Passkey schema (run `bun run auth:generate` once enabling)
- [ ] Removal of `packages/apps/backend/` (final swap commit)

## File layout

```
src/
├── apps/                 # Bun entry × 2
│   ├── app-api/main.ts
│   └── admin-api/main.ts
├── auth/                 # BetterAuth instances + Layers
│   ├── app-auth.ts
│   ├── admin-auth.ts
│   ├── auth-layer.ts
│   └── email.ts
├── config/env.ts         # Effect.Config
├── errors/               # (TODO: TaggedError ports)
├── http/
│   ├── api-app/          # HttpApi schema definitions (App)
│   ├── api-admin/        # HttpApi schema definitions (Admin)
│   ├── handlers-app/     # HttpApiBuilder.group implementations (App)
│   ├── handlers-admin/   # HttpApiBuilder.group implementations (Admin)
│   └── middleware/       # (TODO: correlation-id, auth)
├── observability/
│   ├── logger.ts         # Effect.Logger (pino)
│   └── correlation-id.ts # FiberRef
└── repository/
    ├── db.ts             # Drizzle Layer
    └── schema/           # Drizzle table definitions (app + admin auth)
```
