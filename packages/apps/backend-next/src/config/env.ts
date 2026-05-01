/**
 * Environment configuration via `Effect.Config`. Replaces the legacy
 * class-validator-based env-validation. Each Config value is parsed and
 * validated lazily at first access (i.e. Layer construction).
 *
 * Adding a new env var:
 *   1. Append a `Config.string("MY_VAR")` (or appropriate parser) to AppConfig.
 *   2. Document it in .env.example.
 *   3. Reference it from a Layer that requires it.
 */
import { Config } from 'effect';

const APP_API_DEFAULT_PORT = 3000;
const ADMIN_API_DEFAULT_PORT = 3001;

export const AppConfig = Config.all({
  databaseUrl: Config.string('DATABASE_URL'),
  appApiPort: Config.integer('APP_API_PORT').pipe(Config.withDefault(APP_API_DEFAULT_PORT)),
  adminApiPort: Config.integer('ADMIN_API_PORT').pipe(Config.withDefault(ADMIN_API_DEFAULT_PORT)),
  betterAuthSecret: Config.redacted('BETTER_AUTH_SECRET'),
  appBaseUrl: Config.string('APP_BASE_URL').pipe(Config.withDefault('http://localhost:3000')),
  adminBaseUrl: Config.string('ADMIN_BASE_URL').pipe(Config.withDefault('http://localhost:3001')),

  // Social providers (App instance only). Make optional so dev runs without them.
  googleClientId: Config.option(Config.string('GOOGLE_CLIENT_ID')),
  googleClientSecret: Config.option(Config.redacted('GOOGLE_CLIENT_SECRET')),
  appleClientId: Config.option(Config.string('APPLE_CLIENT_ID')),
  appleClientSecret: Config.option(Config.redacted('APPLE_CLIENT_SECRET')),

  // Magic Link / email provider. Wire to Resend/SES/SendGrid in src/auth/email.ts.
  emailFrom: Config.string('EMAIL_FROM').pipe(Config.withDefault('noreply@example.com')),
  resendApiKey: Config.option(Config.redacted('RESEND_API_KEY')),

  nodeEnv: Config.literal('development', 'staging', 'production', 'test')('NODE_ENV').pipe(
    Config.withDefault('development' as const),
  ),
});

export type AppConfigShape = Config.Config.Success<typeof AppConfig>;
