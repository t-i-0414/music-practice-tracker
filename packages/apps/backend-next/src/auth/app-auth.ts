/**
 * BetterAuth instance for the App API (mobile/web users).
 *
 * Plugins enabled:
 * - magicLink: passwordless login (calls sendMagicLink with the token URL)
 * - bearer: returns Bearer tokens in addition to cookies (mobile uses Bearer)
 *
 * Plugins to add when ready:
 * - passkey({ rpName, rpID }): WebAuthn (requires extra DB tables — run `bun run auth:generate`)
 * - admin(): user impersonation (BetterAuth admin plugin)
 *
 * Constructed eagerly per-process (not as an Effect Layer) because BetterAuth's
 * handler is a plain Web standard `(req: Request) => Promise<Response>`.
 * Wrap it with `provideAppAuth` (in src/auth/auth-handler.ts) to expose it via
 * the Context.Tag system for HTTP middleware.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, magicLink } from 'better-auth/plugins';

import { type DrizzleDb } from '@/repository/db';
import * as schema from '@/repository/schema/app-auth';

export type AppAuthConfig = {
  baseURL: string;
  secret: string;
  google?: { clientId: string; clientSecret: string };
  apple?: { clientId: string; clientSecret: string };
  sendMagicLink: (params: { email: string; url: string; token: string }) => Promise<void>;
};

export type AppAuthInstance = ReturnType<typeof createAppAuth>;

/**
 * Build a BetterAuth instance bound to a Drizzle client.
 * Tests can pass a transaction-scoped `db` to isolate state per test.
 *
 * Return type is intentionally inferred from `betterAuth(...)` so the
 * generic options stay attached (BetterAuth's `Auth` type is parameterized
 * by the literal options passed in).
 */
export const createAppAuth = (db: DrizzleDb, cfg: AppAuthConfig) =>
  betterAuth({
    baseURL: cfg.baseURL,
    secret: cfg.secret,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    user: {
      additionalFields: {
        status: {
          type: ['ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED'] as const,
          required: false,
          defaultValue: 'ACTIVE',
          input: false, // status is server-managed; clients cannot self-suspend
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    socialProviders: {
      ...(cfg.google ? { google: cfg.google } : {}),
      ...(cfg.apple ? { apple: cfg.apple } : {}),
    },
    plugins: [
      magicLink({
        sendMagicLink: cfg.sendMagicLink,
      }),
      bearer(),
      // TODO(passkey): passkey({ rpName: "Music Practice Tracker", rpID: "..." }),
    ],
  });
