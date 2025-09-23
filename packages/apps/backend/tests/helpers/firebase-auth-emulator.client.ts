import { randomUUID } from 'node:crypto';
import { request } from 'node:http';
import { URLSearchParams } from 'node:url';

const DEFAULT_AUTH_HOST = 'localhost:9099';
const DEFAULT_PROJECT_ID = 'music-practice-tracker-test';
const DEFAULT_WEB_API_KEY = 'test-api-key';

type HttpMethod = 'GET' | 'POST' | 'DELETE';

type EmulatorConfig = {
  host: string;
  projectId: string;
  apiKey: string;
};

export type FirebaseEmulatorUser = {
  email: string;
  localId: string;
  idToken: string;
  refreshToken: string;
  password?: string;
};

export type CreateEmailUserOptions = {
  email?: string;
  password?: string;
  displayName?: string;
  emailVerified?: boolean;
};

function resolveConfig(): EmulatorConfig {
  const host = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? DEFAULT_AUTH_HOST;
  const projectId = process.env.FIREBASE_PROJECT_ID ?? DEFAULT_PROJECT_ID;
  const apiKey = process.env.FIREBASE_WEB_API_KEY ?? DEFAULT_WEB_API_KEY;

  process.env.FIREBASE_AUTH_EMULATOR_HOST = host;
  process.env.FIREBASE_PROJECT_ID = projectId;
  process.env.FIREBASE_WEB_API_KEY = apiKey;

  return { host, projectId, apiKey };
}

function normalizeHost(host: string): { hostname: string; port: number } {
  const withoutProtocol = host.replace(/^https?:\/\//u, '');
  const colonIndex = withoutProtocol.indexOf(':');

  if (colonIndex === -1) {
    return { hostname: withoutProtocol, port: 9099 };
  }

  const hostname = withoutProtocol.slice(0, colonIndex);
  const portSegment = withoutProtocol.slice(colonIndex + 1);

  if (!/^\d+$/u.test(portSegment)) {
    throw new Error(`Invalid FIREBASE_AUTH_EMULATOR_HOST port: ${portSegment}`);
  }

  const parsedPort = Number.parseInt(portSegment, 10);
  return { hostname, port: parsedPort };
}

async function httpJsonRequest<TResponse>(
  host: string,
  path: string,
  method: HttpMethod,
  body?: Record<string, unknown>,
): Promise<TResponse> {
  const { hostname, port } = normalizeHost(host);
  const payload = body !== undefined ? JSON.stringify(body) : undefined;

  return new Promise<TResponse>((resolve, reject) => {
    const req = request(
      {
        protocol: 'http:',
        hostname,
        port,
        path,
        method,
        headers:
          payload !== undefined
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload).toString(),
              }
            : undefined,
        timeout: 5_000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString();
          if ((res.statusCode ?? 500) >= 400) {
            reject(new Error(`Firebase Auth emulator request failed (${res.statusCode}): ${raw}`));
            return;
          }
          if (raw.length === 0) {
            resolve({} as TResponse);
            return;
          }
          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(new Error(`Failed to parse Firebase Auth emulator response: ${raw}`));
          }
        });
      },
    );

    req.on('timeout', () => {
      req.destroy(new Error('Request to Firebase Auth emulator timed out.'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (payload !== undefined) {
      req.write(payload);
    }

    req.end();
  });
}

function buildIdentityToolkitPath(apiKey: string, endpoint: string): string {
  return `/identitytoolkit.googleapis.com/v1/${endpoint}?key=${encodeURIComponent(apiKey)}`;
}

export async function resetAuthEmulator(): Promise<void> {
  const { host, projectId } = resolveConfig();
  await httpJsonRequest(host, `/emulator/v1/projects/${projectId}/accounts`, 'DELETE');
}

export async function createEmailUser(options: CreateEmailUserOptions = {}): Promise<FirebaseEmulatorUser> {
  const { host, apiKey } = resolveConfig();

  const email = options.email ?? `user-${randomUUID()}@example.com`;
  const password = options.password ?? `Passw0rd!${randomUUID().slice(0, 12)}`;

  type SignUpResponse = {
    localId: string;
    email: string;
    idToken: string;
    refreshToken: string;
  };

  const signUpResponse = await httpJsonRequest<SignUpResponse>(
    host,
    buildIdentityToolkitPath(apiKey, 'accounts:signUp'),
    'POST',
    {
      email,
      password,
      displayName: options.displayName,
      returnSecureToken: true,
    },
  );

  let { idToken, refreshToken } = signUpResponse;

  if (options.emailVerified === true || options.displayName !== undefined) {
    const updateResponse = await httpJsonRequest<{ idToken?: string; refreshToken?: string }>(
      host,
      buildIdentityToolkitPath(apiKey, 'accounts:update'),
      'POST',
      {
        idToken,
        emailVerified: options.emailVerified ?? false,
        displayName: options.displayName,
        returnSecureToken: true,
      },
    );

    idToken = updateResponse.idToken ?? idToken;
    refreshToken = updateResponse.refreshToken ?? refreshToken;
  }

  return {
    email: signUpResponse.email,
    localId: signUpResponse.localId,
    idToken,
    refreshToken,
    password,
  };
}

export async function signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseEmulatorUser> {
  const { host, apiKey } = resolveConfig();

  type SignInResponse = {
    localId: string;
    idToken: string;
    refreshToken: string;
    email: string;
  };

  const response = await httpJsonRequest<SignInResponse>(
    host,
    buildIdentityToolkitPath(apiKey, 'accounts:signInWithPassword'),
    'POST',
    {
      email,
      password,
      returnSecureToken: true,
    },
  );

  const { email: responseEmail, localId, idToken: signedInIdToken, refreshToken: signedInRefreshToken } = response;

  return {
    email: responseEmail,
    localId,
    idToken: signedInIdToken,
    refreshToken: signedInRefreshToken,
    password,
  };
}

export async function linkProviderToUser(
  user: FirebaseEmulatorUser,
  providerId: string,
): Promise<FirebaseEmulatorUser> {
  const { host, apiKey } = resolveConfig();
  const postBody = new URLSearchParams({
    providerId,
    id_token: `fake-${providerId}-token-${randomUUID()}`,
  }).toString();

  type SignInWithIdpResponse = {
    idToken?: string;
    refreshToken?: string;
    localId?: string;
    email?: string;
  };

  const response = await httpJsonRequest<SignInWithIdpResponse>(
    host,
    buildIdentityToolkitPath(apiKey, 'accounts:signInWithIdp'),
    'POST',
    {
      requestUri: 'http://localhost',
      postBody,
      returnSecureToken: true,
      idToken: user.idToken,
    },
  );

  return {
    email: response.email ?? user.email,
    localId: response.localId ?? user.localId,
    idToken: response.idToken ?? user.idToken,
    refreshToken: response.refreshToken ?? user.refreshToken,
  };
}

export function buildAuthHeader(idToken: string): string {
  return `Bearer ${idToken}`;
}

export async function deleteUserWithIdToken(idToken: string): Promise<void> {
  const { host, apiKey } = resolveConfig();
  await httpJsonRequest(host, buildIdentityToolkitPath(apiKey, 'accounts:delete'), 'POST', {
    idToken,
  });
}

export async function isUserPresent(localId: string): Promise<boolean> {
  const { host, apiKey } = resolveConfig();
  try {
    const response = await httpJsonRequest<{ users?: { localId: string }[] }>(
      host,
      buildIdentityToolkitPath(apiKey, 'accounts:lookup'),
      'POST',
      {
        localId: [localId],
      },
    );
    return Array.isArray(response.users) && response.users.length > 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('USER_NOT_FOUND') || message.includes('userNotFound')) {
      return false;
    }
    throw error;
  }
}
