/**
 * App API entry. Listens on APP_API_PORT (default 3000) via BunHttpServer.
 *
 * Currently mounted:
 *   - GET /health (Effect HttpApi)
 *   - GET /docs/openapi.json (auto-generated OpenAPI doc)
 *
 * TODO (next session):
 *   - Mount BetterAuth at /api/auth/* — see "Mounting BetterAuth" below.
 *   - Add user / session middleware that reads BetterAuth session and pushes
 *     `CurrentUser` into the FiberRef.
 *
 * --- Mounting BetterAuth ---
 *
 * BetterAuth's `auth.handler` is a `(req: Request) => Promise<Response>`. To
 * integrate, add a wildcard route via `HttpLayerRouter.use`:
 *
 *   const BetterAuthRoute = HttpLayerRouter.use(
 *     Effect.fn(function* (router) {
 *       yield* router.add('ALL', '/api/auth/*', Effect.gen(function* () {
 *         const httpReq = yield* HttpServerRequest.HttpServerRequest;
 *         const body = httpReq.method === 'GET' || httpReq.method === 'HEAD'
 *           ? null
 *           : yield* httpReq.arrayBuffer;
 *         const webReq = new Request(httpReq.originalUrl, {
 *           method: httpReq.method,
 *           headers: new Headers(httpReq.headers as Record<string, string>),
 *           body,
 *         });
 *         const response = yield* Effect.promise(() => auth.handler(webReq));
 *         return HttpServerResponse.raw(response.body, {
 *           status: response.status,
 *           headers: Object.fromEntries(response.headers),
 *         });
 *       }));
 *     })
 *   );
 *
 * Then merge: `Layer.mergeAll(ApiRoutesLayer, BetterAuthRoute)`.
 */
import { HttpLayerRouter } from '@effect/platform';
import { BunHttpServer, BunRuntime } from '@effect/platform-bun';
import { Layer, Logger, LogLevel } from 'effect';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { createAppAuth } from '@/auth/app-auth';
import { makeStubSendMagicLink } from '@/auth/email';
import { AppApi } from '@/http/api-app/health.api';
import { HealthGroupLive } from '@/http/handlers-app/health/health.handler';
import { PinoLoggerLive } from '@/observability/logger';
import { Db } from '@/repository/db';
import * as schema from '@/repository/schema';

const APP_API_DEFAULT_PORT = 3000;

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (typeof value !== 'string' || value === '') {
    throw new Error(`Required env var ${key} is not set`);
  }
  return value;
};

const databaseUrl = requireEnv('DATABASE_URL');
const betterAuthSecret = requireEnv('BETTER_AUTH_SECRET');
const port = Number(process.env['APP_API_PORT'] ?? APP_API_DEFAULT_PORT);
const baseURL = process.env['APP_BASE_URL'] ?? `http://localhost:${String(port)}`;

const pool = new pg.Pool({ connectionString: databaseUrl });
const db = drizzle(pool, { schema, casing: 'snake_case' });

// BetterAuth instance is constructed eagerly so it can be mounted later.
// See the comment block above for integration steps.
// Re-exported (and assigned to globalThis) so the next session can wire it
// without restructuring imports. Remove the global once mounted.
export const auth = createAppAuth(db, {
  baseURL,
  secret: betterAuthSecret,
  google:
    process.env['GOOGLE_CLIENT_ID'] !== undefined && process.env['GOOGLE_CLIENT_SECRET'] !== undefined
      ? {
          clientId: process.env['GOOGLE_CLIENT_ID'],
          clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        }
      : undefined,
  apple:
    process.env['APPLE_CLIENT_ID'] !== undefined && process.env['APPLE_CLIENT_SECRET'] !== undefined
      ? {
          clientId: process.env['APPLE_CLIENT_ID'],
          clientSecret: process.env['APPLE_CLIENT_SECRET'],
        }
      : undefined,
  sendMagicLink: makeStubSendMagicLink('app'),
});

const DbLayer = Layer.succeed(Db, { db, pool });

const ApiRoutesLayer = HttpLayerRouter.addHttpApi(AppApi, { openapiPath: '/docs/openapi.json' }).pipe(
  Layer.provide(HealthGroupLive),
);

const ServerLive = HttpLayerRouter.serve(ApiRoutesLayer).pipe(
  Layer.provide(BunHttpServer.layer({ port })),
  Layer.provide(DbLayer),
  Layer.provide(PinoLoggerLive),
  Layer.provide(Logger.minimumLogLevel(LogLevel.Debug)),
);

BunRuntime.runMain(Layer.launch(ServerLive));
