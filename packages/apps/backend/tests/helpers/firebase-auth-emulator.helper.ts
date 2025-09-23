import { randomUUID } from 'node:crypto';

export class FirebaseAuthEmulatorHelper {
  private static readonly DEFAULT_PASSWORD = 'Password123!';
  private static readonly API_KEY = 'test-api-key';
  private readonly emulatorOrigin: string;
  private readonly projectId: string;

  public constructor() {
    const host = process.env.FIREBASE_AUTH_EMULATOR_HOST;
    if (typeof host !== 'string' || host.trim() === '') {
      throw new Error('FIREBASE_AUTH_EMULATOR_HOST must be defined to run Firebase Auth emulator tests.');
    }

    this.emulatorOrigin = host.startsWith('http://') || host.startsWith('https://') ? host : `http://${host}`;

    const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT;
    if (typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('FIREBASE_PROJECT_ID (or GCLOUD_PROJECT) must be defined for Firebase emulator tests.');
    }

    this.projectId = projectId.trim();
  }

  public async ensureHealthy(): Promise<void> {
    const response = await fetch(`${this.emulatorOrigin}/emulator/v1/projects/${this.projectId}/config`);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Firebase Auth emulator is not reachable: ${response.status} ${body}`);
    }
  }

  public async resetAllUsers(): Promise<void> {
    const response = await fetch(`${this.emulatorOrigin}/emulator/v1/projects/${this.projectId}/accounts`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to reset Firebase Auth emulator users: ${response.status} ${body}`);
    }
  }

  public async createVerifiedUser(
    {
      email,
      password,
    }: {
      email: string;
      password: string;
    } = {
      email: `test-${randomUUID()}@example.com`,
      password: FirebaseAuthEmulatorHelper.DEFAULT_PASSWORD,
    },
  ): Promise<{
    uid: string;
    email: string;
    password: string;
    idToken: string;
  }> {
    const signUpResponse = await this.postIdentityToolkit<{
      idToken: string;
      email: string;
      refreshToken: string;
      expiresIn: string;
      localId: string;
    }>('accounts:signUp', {
      email,
      password,
      returnSecureToken: true,
    });

    if (typeof signUpResponse.localId !== 'string' || signUpResponse.localId.trim() === '') {
      throw new Error(`Firebase signUp response is missing localId: ${JSON.stringify(signUpResponse)}`);
    }

    const uid = signUpResponse.localId;

    const updatePayload: Record<string, unknown> = {
      idToken: signUpResponse.idToken,
      emailVerified: true,
      returnSecureToken: true,
    };

    await this.postIdentityToolkit('accounts:update', updatePayload);

    // Firebase emulator doesn't properly set email_verified via accounts:update
    // So we need to create a custom token with email_verified: true
    // For testing purposes, we'll create an unsigned JWT that the emulator accepts
    const header = { alg: 'none', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: `https://securetoken.google.com/${this.projectId}`,
      aud: this.projectId,
      auth_time: now,
      user_id: uid,
      sub: uid,
      iat: now,
      exp: now + 3600,
      email,
      email_verified: true,
      firebase: {
        identities: {
          email: [email],
        },
        sign_in_provider: 'password',
      },
    };

    const idToken = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(
      JSON.stringify(payload),
    ).toString('base64url')}.`;

    return { uid, email, password, idToken };
  }

  public async getUserByIdToken(
    idToken: string,
  ): Promise<{ uid: string; email: string; emailVerified: boolean } | null> {
    try {
      const response = await fetch(
        `${this.emulatorOrigin}/identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FirebaseAuthEmulatorHelper.API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        },
      );

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(
          `Firebase Auth emulator request failed (accounts:lookup): ${response.status} ${response.statusText} ${responseBody}`,
        );
      }

      const responseBody = (await response.json()) as {
        users?: { localId: string; email: string; emailVerified: boolean }[];
      };

      if (!responseBody.users || responseBody.users.length === 0) {
        return null;
      }

      const [user] = responseBody.users;
      return { uid: user.localId, email: user.email, emailVerified: user.emailVerified };
    } catch (error) {
      if (error instanceof Error && error.message.includes('USER_NOT_FOUND')) {
        return null;
      }
      throw error;
    }
  }

  private async postIdentityToolkit<TResponse>(path: string, body: unknown): Promise<TResponse> {
    const response = await fetch(
      `${this.emulatorOrigin}/identitytoolkit.googleapis.com/v1/${path}?key=${FirebaseAuthEmulatorHelper.API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(
        `Firebase Auth emulator request failed (${path}): ${response.status} ${response.statusText} ${responseBody}`,
      );
    }

    return (await response.json()) as TResponse;
  }
}
