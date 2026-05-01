/**
 * Barrel for Drizzle schemas. drizzle-kit reads this to detect all tables
 * for migration generation.
 *
 * BetterAuth instances each get their own schema module:
 * - app-auth.ts → app_* tables (mobile/app users)
 * - admin-auth.ts → admin_* tables (dashboard users)
 *
 * Domain entities that aren't BetterAuth-managed (future: practice sessions,
 * songs, etc.) should be added as separate modules and re-exported here.
 */
export * as appAuth from './app-auth';
export * as adminAuth from './admin-auth';
