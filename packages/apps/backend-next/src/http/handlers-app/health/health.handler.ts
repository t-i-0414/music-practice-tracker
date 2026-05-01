/**
 * Implementation Layer for the App API "health" group. Composed into the
 * HttpLayerRouter via `Layer.provide(HealthGroupLive)` in src/apps/app-api/main.ts.
 */
import { HttpApiBuilder } from '@effect/platform';
import { Effect } from 'effect';
import { sql } from 'drizzle-orm';

import { Db } from '@/repository/db';

import { AppApi } from '../../api-app/health.api';

export const HealthGroupLive = HttpApiBuilder.group(AppApi, 'health', (handlers) =>
  handlers.handle('check', () =>
    Effect.gen(function* () {
      const { db } = yield* Db;
      const dbStatus = yield* Effect.tryPromise({
        try: () => db.execute(sql`SELECT 1`),
        catch: () => new Error('db_unreachable'),
      }).pipe(
        Effect.map(() => 'reachable' as const),
        Effect.catchAll(() => Effect.succeed('unreachable' as const)),
      );

      return {
        status: 'ok' as const,
        service: 'app-api' as const,
        db: dbStatus,
        timestamp: new Date().toISOString(),
      };
    }),
  ),
);
