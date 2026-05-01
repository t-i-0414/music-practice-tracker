/**
 * Drizzle client provided as an Effect `Layer`. Replaces the legacy
 * `RepositoryService` (NestJS @Injectable wrapping PrismaClient).
 *
 * Consumers `yield* Db` inside Effect.gen and call drizzle-orm functions:
 *
 *   const fetchUser = (id: string) =>
 *     Effect.gen(function* () {
 *       const { db } = yield* Db;
 *       return yield* Effect.tryPromise(() =>
 *         db.select().from(appAuth.user).where(eq(appAuth.user.id, id))
 *       );
 *     });
 *
 * The `pool` is exported alongside `db` so BetterAuth's drizzleAdapter
 * (and tests requiring direct SQL) can reuse the same connection pool.
 */
import { Context, Effect, Layer } from 'effect';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { AppConfig } from '@/config/env';
import * as schema from '@/repository/schema';

export type Schema = typeof schema;
export type DrizzleDb = NodePgDatabase<Schema>;

export class Db extends Context.Tag('@app/Db')<
  Db,
  {
    readonly db: DrizzleDb;
    readonly pool: pg.Pool;
  }
>() {}

export const DbLive = Layer.scoped(
  Db,
  Effect.gen(function* () {
    const cfg = yield* AppConfig;
    const pool = new pg.Pool({ connectionString: cfg.databaseUrl });

    yield* Effect.addFinalizer(() =>
      Effect.promise(async () => {
        await pool.end();
      }),
    );

    const db = drizzle(pool, { schema, casing: 'snake_case' });
    return { db, pool };
  }),
);
