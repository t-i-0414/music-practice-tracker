import { Test, TestingModule } from '@nestjs/testing';
import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';

import { FirebaseAuthProvider } from '@/firebase-auth/firebase-auth.provider';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';

jest.mock<typeof import('firebase-admin')>('firebase-admin', () => {
  const apps: unknown[] = [];
  const initializeApp = jest.fn();
  const app = jest.fn();
  const credential = {
    applicationDefault: jest.fn(),
    cert: jest.fn(),
  };

  return {
    __esModule: true,
    apps,
    initializeApp,
    app,
    credential,
  } as unknown as typeof import('firebase-admin');
});

const firebaseAdmin = jest.requireMock('firebase-admin') as unknown as {
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

const createAuthMock = () => ({
  verifyIdToken: jest.fn(),
  getUser: jest.fn(),
  deleteUser: jest.fn(),
  deleteUsers: jest.fn(),
});

const resetFirebaseAdmin = (authMock: ReturnType<typeof createAuthMock>) => {
  firebaseAdmin.apps.splice(0, firebaseAdmin.apps.length);
  firebaseAdmin.initializeApp.mockReset();
  firebaseAdmin.app.mockReset();
  firebaseAdmin.credential.applicationDefault.mockReset();
  firebaseAdmin.credential.cert.mockReset();

  firebaseAdmin.credential.applicationDefault.mockReturnValue('application-default-credential');
  firebaseAdmin.credential.cert.mockImplementation((serviceAccount: unknown) => ({ cert: serviceAccount }));

  firebaseAdmin.initializeApp.mockImplementation(() => {
    const firebaseApp = {
      auth: jest.fn(() => authMock),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    firebaseAdmin.apps.push(firebaseApp);
    return firebaseApp;
  });

  firebaseAdmin.app.mockImplementation(() => {
    const [existingApp] = firebaseAdmin.apps;
    return existingApp;
  });
};

describe('integration FirebaseAuthService', () => {
  let testingModule: TestingModule;
  let provider: FirebaseAuthProvider;
  let service: FirebaseAuthService;
  let authMock: ReturnType<typeof createAuthMock>;

  beforeEach(async () => {
    authMock = createAuthMock();
    resetFirebaseAdmin(authMock);

    testingModule = await Test.createTestingModule({
      providers: [FirebaseAuthProvider, FirebaseAuthService],
    }).compile();

    provider = testingModule.get(FirebaseAuthProvider);
    service = testingModule.get(FirebaseAuthService);

    provider.onModuleInit();
  });

  afterEach(async () => {
    await testingModule.close();
    firebaseAdmin.apps.splice(0, firebaseAdmin.apps.length);
    jest.clearAllMocks();
  });

  describe('verifyIdToken', () => {
    it('returns decoded token when firebase verification succeeds', async () => {
      expect.assertions(3);

      const decoded = { uid: 'uid-int-success' } as DecodedIdToken;
      authMock.verifyIdToken.mockResolvedValue(decoded);

      const result = await service.verifyIdToken('token-success');

      expect(firebaseAdmin.initializeApp).toHaveBeenCalledTimes(1);
      expect(authMock.verifyIdToken).toHaveBeenCalledWith('token-success', false);
      expect(result).toBe(decoded);
    });

    it('maps firebase expiration errors to FB0004', async () => {
      expect.assertions(2);

      const error = Object.assign(new Error('expired'), { code: 'auth/id-token-expired' });
      authMock.verifyIdToken.mockRejectedValue(error);

      await expect(service.verifyIdToken('token-expired')).rejects.toMatchObject({
        errorCode: 'FB0004',
        detail: 'Firebase token expired.',
      });
      expect(authMock.verifyIdToken).toHaveBeenCalledWith('token-expired', false);
    });

    it('maps firebase revoked errors to FB0005', async () => {
      expect.assertions(2);

      const error = Object.assign(new Error('revoked'), { code: 'auth/id-token-revoked' });
      authMock.verifyIdToken.mockRejectedValue(error);

      await expect(service.verifyIdToken('token-revoked')).rejects.toMatchObject({
        errorCode: 'FB0005',
        detail: 'Firebase token revoked.',
      });
      expect(authMock.verifyIdToken).toHaveBeenCalledWith('token-revoked', false);
    });

    it('maps other firebase errors to FB0006', async () => {
      expect.assertions(2);

      const error = Object.assign(new Error('other'), { code: 'auth/unknown-error' });
      authMock.verifyIdToken.mockRejectedValue(error);

      await expect(service.verifyIdToken('token-invalid')).rejects.toMatchObject({
        errorCode: 'FB0006',
        detail: 'Firebase invalid token.',
      });
      expect(authMock.verifyIdToken).toHaveBeenCalledWith('token-invalid', false);
    });

    it('maps non-firebase errors to FB0006', async () => {
      expect.assertions(2);

      authMock.verifyIdToken.mockRejectedValue(new Error('non-firebase-error'));

      await expect(service.verifyIdToken('token-error')).rejects.toMatchObject({
        errorCode: 'FB0006',
        detail: 'Firebase invalid token.',
      });
      expect(authMock.verifyIdToken).toHaveBeenCalledWith('token-error', false);
    });
  });

  describe('getUser', () => {
    it('returns firebase user when lookup succeeds', async () => {
      expect.assertions(2);

      const user = { uid: 'uid-int-user' } as unknown as UserRecord;
      authMock.getUser.mockResolvedValue(user);

      const result = await service.getUser('uid-int-user');

      expect(authMock.getUser).toHaveBeenCalledWith('uid-int-user');
      expect(result).toBe(user);
    });

    it('wraps firebase failures with FB0007', async () => {
      expect.assertions(2);

      authMock.getUser.mockRejectedValue(new Error('not found'));

      await expect(service.getUser('uid-missing')).rejects.toMatchObject({
        errorCode: 'FB0007',
        detail: 'Firebase user not found.',
      });
      expect(authMock.getUser).toHaveBeenCalledWith('uid-missing');
    });
  });

  describe('deleteUser', () => {
    it('treats user-not-found as a successful deletion', async () => {
      expect.assertions(2);

      const error = Object.assign(new Error('missing'), { code: 'auth/user-not-found' });
      authMock.deleteUser.mockRejectedValue(error);

      await expect(service.deleteUser('uid-already-deleted')).resolves.toBeUndefined();
      expect(authMock.deleteUser).toHaveBeenCalledWith('uid-already-deleted');
    });

    it('propagates other firebase errors as FB0008', async () => {
      expect.assertions(2);

      authMock.deleteUser.mockRejectedValue(new Error('internal failure'));

      await expect(service.deleteUser('uid-error')).rejects.toMatchObject({
        errorCode: 'FB0008',
        detail: 'Failed to delete Firebase user.',
      });
      expect(authMock.deleteUser).toHaveBeenCalledWith('uid-error');
    });
  });

  describe('deleteUsers', () => {
    it('returns immediately for an empty UIDs array without calling Firebase', async () => {
      expect.assertions(1);

      await service.deleteUsers([]);

      expect(authMock.deleteUsers).not.toHaveBeenCalled();
    });

    it('succeeds when all accounts are deleted without failures', async () => {
      expect.assertions(2);

      authMock.deleteUsers.mockResolvedValue({ successCount: 2, failureCount: 0, errors: [] });

      await expect(service.deleteUsers(['uid-1', 'uid-2'])).resolves.toBeUndefined();
      expect(authMock.deleteUsers).toHaveBeenCalledWith(['uid-1', 'uid-2']);
    });

    it('throws FB0009 with per-UID error details when some accounts fail', async () => {
      expect.assertions(2);

      authMock.deleteUsers.mockResolvedValue({
        successCount: 1,
        failureCount: 1,
        errors: [{ index: 1, error: { message: 'internal error' } }],
      });

      await expect(service.deleteUsers(['uid-ok', 'uid-fail'])).rejects.toMatchObject({
        errorCode: 'FB0009',
        detail: '1 of 2 Firebase account(s) failed to delete: index=1 error=internal error',
      });
      expect(authMock.deleteUsers).toHaveBeenCalledWith(['uid-ok', 'uid-fail']);
    });

    it('wraps unexpected SDK errors as FB0009', async () => {
      expect.assertions(1);

      authMock.deleteUsers.mockRejectedValue(new Error('network timeout'));

      await expect(service.deleteUsers(['uid-1'])).rejects.toMatchObject({
        errorCode: 'FB0009',
        detail: 'Failed to delete Firebase users in bulk.',
      });
    });

    it('throws FB0009 when UIDs exceed the 1000 batch limit', async () => {
      expect.assertions(2);

      const oversizedUids = Array.from({ length: 1001 }, (_, i) => `uid-${String(i)}`);

      await expect(service.deleteUsers(oversizedUids)).rejects.toMatchObject({
        errorCode: 'FB0009',
        detail: 'Failed to delete Firebase users in bulk.',
      });
      expect(authMock.deleteUsers).not.toHaveBeenCalled();
    });
  });
});
