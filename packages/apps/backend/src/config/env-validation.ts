import { plainToInstance } from 'class-transformer';
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

const NodeEnvValues = ['development', 'staging', 'production', 'test'] as const;

const NO_ERRORS = 0;

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  public DATABASE_URL: string;

  @IsEnum(NodeEnvValues)
  @IsOptional()
  public NODE_ENV?: (typeof NodeEnvValues)[number];

  @IsNumber()
  @IsOptional()
  public APP_API_PORT?: number;

  @IsNumber()
  @IsOptional()
  public ADMIN_API_PORT?: number;

  @IsString()
  @IsOptional()
  public FIREBASE_AUTH_EMULATOR_HOST?: string;

  @IsString()
  @IsOptional()
  public GOOGLE_CLOUD_PROJECT?: string;

  @IsString()
  @IsOptional()
  public GCLOUD_PROJECT?: string;

  @IsString()
  @IsOptional()
  public FIREBASE_PROJECT_ID?: string;

  @IsString()
  @IsOptional()
  public FIREBASE_SERVICE_ACCOUNT?: string;

  @IsIn(['true', 'false'])
  @IsOptional()
  public FIREBASE_CHECK_REVOKED?: 'true' | 'false';
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: false,
  });

  if (errors.length > NO_ERRORS) {
    const messages = errors.map(({ property, constraints }) => {
      if (constraints !== undefined) {
        return `${property}: ${Object.values(constraints).join(', ')}`;
      }
      return `${property}: validation failed`;
    });
    // eslint-disable-next-line custom-backend-eslint/throw-new-common-error-only -- Startup validation runs before NestJS error infrastructure
    throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
  }

  return validatedConfig;
}
