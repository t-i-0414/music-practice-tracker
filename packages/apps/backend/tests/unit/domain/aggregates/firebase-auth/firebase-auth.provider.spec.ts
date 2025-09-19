import { FirebaseAuthProvider } from '@/domain/aggregates/firebase-auth/firebase-auth.provider';
import { DomainError } from '@/domain/utils/domain.error';

jest.mock<typeof import('firebase-admin')>('firebase-admin', () => {
  const apps: unknown[] = [];
  const initializeApp = jest.fn();
  const app = jest.fn();
  const credential = {
    applicationDefault: jest.fn(() => 'application-default-credential'),
    cert: jest.fn((serviceAccount: unknown) => ({ cert: serviceAccount })),
  };

  return {
    __esModule: true,
    apps,
    initializeApp,
    app,
    credential,
  } as unknown as typeof import('firebase-admin');
});

type FirebaseAdminMock = {
  apps: {
    auth: jest.Mock;
    delete: jest.Mock;
  }[];
  initializeApp: jest.Mock;
  app: jest.Mock;
  credential: {
    applicationDefault: jest.Mock;
    cert: jest.Mock;
  };
};

const firebaseAdmin = jest.requireMock('firebase-admin') as unknown as FirebaseAdminMock;

const SERVICE_ACCOUNT_KEYS = [
  'FIREBASE_AUTH_EMULATOR_HOST',
  'GOOGLE_CLOUD_PROJECT',
  'GCLOUD_PROJECT',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_SERVICE_ACCOUNT',
] as const;

const createFirebaseApp = () => ({
  auth: jest.fn(() => 'mock-auth'),
  delete: jest.fn().mockResolvedValue(undefined),
});

const restoreEnv: Record<(typeof SERVICE_ACCOUNT_KEYS)[number], string | undefined> = Object.fromEntries(
  SERVICE_ACCOUNT_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof SERVICE_ACCOUNT_KEYS)[number], string | undefined>;

describe('unit FirebaseAuthProvider', () => {
  beforeEach(() => {
    firebaseAdmin.apps.splice(0, firebaseAdmin.apps.length);
    firebaseAdmin.initializeApp.mockReset();
    firebaseAdmin.app.mockReset();
    firebaseAdmin.credential.applicationDefault.mockReset();
    firebaseAdmin.credential.cert.mockReset();

    firebaseAdmin.credential.applicationDefault.mockReturnValue('application-default-credential');
    firebaseAdmin.credential.cert.mockImplementation((serviceAccount: unknown) => ({ cert: serviceAccount }));

    SERVICE_ACCOUNT_KEYS.forEach((key) => {
      if (restoreEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = restoreEnv[key];
      }
    });
  });

  afterAll(() => {
    SERVICE_ACCOUNT_KEYS.forEach((key) => {
      if (restoreEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = restoreEnv[key];
      }
    });
  });

  it('reuses an already initialized firebase app', () => {
    expect.assertions(5);

    const existingApp = createFirebaseApp();
    existingApp.auth.mockReturnValue('existing-auth');
    firebaseAdmin.apps.push(existingApp);
    firebaseAdmin.app.mockReturnValue(existingApp);

    const provider = new FirebaseAuthProvider();

    provider.onModuleInit();

    expect(firebaseAdmin.app).toHaveBeenCalledTimes(1);
    expect(firebaseAdmin.initializeApp).not.toHaveBeenCalled();
    expect(existingApp.auth).not.toHaveBeenCalled();

    const auth = provider.auth();

    expect(existingApp.auth).toHaveBeenCalledTimes(1);
    expect(auth).toBe('existing-auth');
  });

  it('initializes firebase using application default credentials when not yet initialized', () => {
    expect.assertions(4);

    const newApp = createFirebaseApp();
    newApp.auth.mockReturnValue('adc-auth');
    firebaseAdmin.initializeApp.mockImplementation(() => {
      firebaseAdmin.apps.push(newApp);
      return newApp;
    });

    const provider = new FirebaseAuthProvider();

    provider.onModuleInit();

    expect(firebaseAdmin.credential.applicationDefault).toHaveBeenCalledTimes(1);
    expect(firebaseAdmin.initializeApp).toHaveBeenCalledWith({
      credential: 'application-default-credential',
    });
    expect(provider.auth()).toBe('adc-auth');
    expect(firebaseAdmin.apps[0]).toBe(newApp);
  });

  it('falls back to emulator configuration when application default credentials fail', () => {
    expect.assertions(4);

    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      throw new Error('adc unavailable');
    });
    const emulatorApp = createFirebaseApp();
    emulatorApp.auth.mockReturnValue('emulator-auth');
    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      firebaseAdmin.apps.push(emulatorApp);
      return emulatorApp;
    });

    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';

    const provider = new FirebaseAuthProvider();

    provider.onModuleInit();

    expect(firebaseAdmin.initializeApp).toHaveBeenNthCalledWith(2, {
      projectId: 'test-project',
    });
    expect(provider.auth()).toBe('emulator-auth');
    expect(firebaseAdmin.credential.cert).not.toHaveBeenCalled();
    expect(firebaseAdmin.apps[firebaseAdmin.apps.length - 1]).toBe(emulatorApp);
  });

  it('uses GCLOUD_PROJECT when GOOGLE_CLOUD_PROJECT is undefined', () => {
    expect.assertions(3);

    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      throw new Error('adc unavailable');
    });
    const emulatorApp = createFirebaseApp();
    emulatorApp.auth.mockReturnValue('gcloud-auth');
    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      firebaseAdmin.apps.push(emulatorApp);
      return emulatorApp;
    });

    delete process.env.GOOGLE_CLOUD_PROJECT;
    process.env.GCLOUD_PROJECT = 'gcloud-project';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

    const provider = new FirebaseAuthProvider();

    provider.onModuleInit();

    expect(firebaseAdmin.initializeApp).toHaveBeenNthCalledWith(2, {
      projectId: 'gcloud-project',
    });
    expect(provider.auth()).toBe('gcloud-auth');
    expect(firebaseAdmin.apps[firebaseAdmin.apps.length - 1]).toBe(emulatorApp);
  });

  it('uses FIREBASE_PROJECT_ID when other project vars are missing', () => {
    expect.assertions(3);

    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      throw new Error('adc unavailable');
    });
    const emulatorApp = createFirebaseApp();
    emulatorApp.auth.mockReturnValue('firebase-project-auth');
    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      firebaseAdmin.apps.push(emulatorApp);
      return emulatorApp;
    });

    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.GCLOUD_PROJECT;
    process.env.FIREBASE_PROJECT_ID = 'firebase-project';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

    const provider = new FirebaseAuthProvider();

    provider.onModuleInit();

    expect(firebaseAdmin.initializeApp).toHaveBeenNthCalledWith(2, {
      projectId: 'firebase-project',
    });
    expect(provider.auth()).toBe('firebase-project-auth');
    expect(firebaseAdmin.apps[firebaseAdmin.apps.length - 1]).toBe(emulatorApp);
  });

  it('throws DO0001 when service account is missing after ADC failure', () => {
    expect.assertions(2);

    firebaseAdmin.initializeApp.mockImplementation(() => {
      throw new Error('adc unavailable');
    });

    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    process.env.FIREBASE_PROJECT_ID = '   ';

    const provider = new FirebaseAuthProvider();

    let caught: unknown;

    try {
      provider.onModuleInit();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(DomainError);
    expect((caught as DomainError).detail).toContain('Firebase Admin credential not configured.');
  });

  it('throws DO0002 when service account JSON is invalid', () => {
    expect.assertions(2);

    firebaseAdmin.initializeApp.mockImplementation(() => {
      throw new Error('adc unavailable');
    });
    process.env.FIREBASE_SERVICE_ACCOUNT = 'not-json';

    const provider = new FirebaseAuthProvider();

    let caught: unknown;

    try {
      provider.onModuleInit();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(DomainError);
    expect((caught as DomainError).detail).toBe('Invalid FIREBASE_SERVICE_ACCOUNT JSON.');
  });

  it('throws DO0002 when service account JSON is missing required properties', () => {
    expect.assertions(1);

    firebaseAdmin.initializeApp.mockImplementation(() => {
      throw new Error('adc unavailable');
    });
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ projectId: 'id-only' });

    const provider = new FirebaseAuthProvider();

    expect(() => {
      provider.onModuleInit();
    }).toThrow('Invalid FIREBASE_SERVICE_ACCOUNT JSON.');
  });

  it('initializes firebase with service account credentials when provided', () => {
    expect.assertions(4);

    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      throw new Error('adc unavailable');
    });

    const serviceAccount = {
      projectId: 'project-123',
      clientEmail: 'user@example.com',
      privateKey: '-----BEGIN KEY-----\\nline2\\n-----END KEY-----',
    };
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(serviceAccount);

    const serviceAccountApp = createFirebaseApp();
    serviceAccountApp.auth.mockReturnValue('service-account-auth');
    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      firebaseAdmin.apps.push(serviceAccountApp);
      return serviceAccountApp;
    });

    const provider = new FirebaseAuthProvider();

    provider.onModuleInit();

    expect(firebaseAdmin.credential.cert).toHaveBeenCalledWith({
      projectId: 'project-123',
      clientEmail: 'user@example.com',
      privateKey: '-----BEGIN KEY-----\nline2\n-----END KEY-----',
    });
    expect(firebaseAdmin.initializeApp).toHaveBeenLastCalledWith({
      credential: { cert: expect.anything() },
    });
    expect(provider.auth()).toBe('service-account-auth');
    expect(firebaseAdmin.apps[firebaseAdmin.apps.length - 1]).toBe(serviceAccountApp);
  });

  it('wraps errors when firebase initialization with service account fails', () => {
    expect.assertions(2);

    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      throw new Error('adc unavailable');
    });
    firebaseAdmin.initializeApp.mockImplementationOnce(() => {
      throw new Error('service account failure');
    });

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      projectId: 'project-abc',
      clientEmail: 'user@example.com',
      privateKey: 'key',
    });

    const provider = new FirebaseAuthProvider();

    let caught: unknown;

    try {
      provider.onModuleInit();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(DomainError);
    expect((caught as DomainError).detail).toBe('Failed to initialize Firebase Admin SDK.');
  });

  it('resolves even when deleting the firebase app fails during shutdown', async () => {
    expect.assertions(2);

    const appInstance = createFirebaseApp();
    appInstance.delete.mockRejectedValue(new Error('failed'));
    firebaseAdmin.initializeApp.mockReturnValue(appInstance);

    const provider = new FirebaseAuthProvider();
    provider.onModuleInit();

    await expect(provider.onModuleDestroy()).resolves.toBeUndefined();
    expect(appInstance.delete).toHaveBeenCalledTimes(1);
  });
});
