import { HttpApiBuilder } from '@effect/platform';
import { Effect } from 'effect';
import { sql } from 'drizzle-orm';

import { Db } from '@/repository/db';

import { AdminApi } from '../../api-admin/health.api';

export const HealthGroupLive = HttpApiBuilder.group(AdminApi, 'health', (handlers) =>
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
        service: 'admin-api' as const,
        db: dbStatus,
        timestamp: new Date().toISOString(),
      };
    }),
  ),
);
