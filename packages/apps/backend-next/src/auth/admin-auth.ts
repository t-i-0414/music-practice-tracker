/**
 * BetterAuth instance for the Admin API (dashboard users).
 *
 * Plugins enabled:
 * - magicLink: primary login mechanism for admins (no password)
 * - admin: enables impersonation of app users
 *
 * Sessions are cookie-based (HttpOnly). The `bearer` plugin is intentionally
 * NOT enabled — admins authenticate from a browser, not native clients.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin, magicLink } from 'better-auth/plugins';

import { type DrizzleDb } from '@/repository/db';
import * as schema from '@/repository/schema/admin-auth';

export type AdminAuthConfig = {
  baseURL: string;
  secret: string;
  sendMagicLink: (params: { email: string; url: string; token: string }) => Promise<void>;
};

export const createAdminAuth = (db: DrizzleDb, cfg: AdminAuthConfig) =>
  betterAuth({
    baseURL: cfg.baseURL,
    secret: cfg.secret,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.adminUser,
        session: schema.adminSession,
        account: schema.adminAccount,
        verification: schema.adminVerification,
      },
    }),
    user: {
      additionalFields: {
        role: {
          type: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'ANALYST', 'VIEWER'] as const,
          required: false,
          defaultValue: 'VIEWER',
          input: false,
        },
        status: {
          type: ['ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED'] as const,
          required: false,
          defaultValue: 'ACTIVE',
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      magicLink({
        sendMagicLink: cfg.sendMagicLink,
      }),
      adminPlugin(),
    ],
  });

export type AdminAuthInstance = ReturnType<typeof createAdminAuth>;
