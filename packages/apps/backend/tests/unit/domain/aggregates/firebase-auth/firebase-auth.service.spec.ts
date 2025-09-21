import { type FirebaseAuthProvider } from '@/domain/aggregates/firebase-auth/firebase-auth.provider';
import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';

describe('unit FirebaseAuthService', () => {
  let auth: jest.Mocked<{
    verifyIdToken: jest.Mock;
    getUser: jest.Mock;
    deleteUser: jest.Mock;
  }>;
  let provider: jest.Mocked<Pick<FirebaseAuthProvider, 'auth'>>;
  let service: FirebaseAuthService;

  beforeEach(() => {
    auth = {
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    provider = {
      auth: jest.fn(() => auth as unknown as ReturnType<FirebaseAuthProvider['auth']>),
    };

    service = new FirebaseAuthService(provider as unknown as FirebaseAuthProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyIdToken', () => {
    it('returns the decoded token when verification succeeds', async () => {
      expect.assertions(3);

      const decoded = { uid: 'uid-123' };
      auth.verifyIdToken.mockResolvedValue(decoded);

      const result = await service.verifyIdToken('token');

      expect(provider.auth).toHaveBeenCalledTimes(1);
      expect(auth.verifyIdToken).toHaveBeenCalledWith('token', false);
      expect(result).toBe(decoded);
    });

    it('passes through the revoke check flag', async () => {
      expect.assertions(1);

      auth.verifyIdToken.mockResolvedValue({});

      await service.verifyIdToken('token', true);

      expect(auth.verifyIdToken).toHaveBeenCalledWith('token', true);
    });

    it('throws DomainError with token expired detail when firebase reports expiration', async () => {
      expect.assertions(1);

      const error = Object.assign(new Error('expired'), { code: 'auth/id-token-expired' });
      auth.verifyIdToken.mockRejectedValue(error);

      await expect(service.verifyIdToken('token')).rejects.toMatchObject({
        errorCode: 'DO0005',
        detail: 'Firebase token expired.',
      });
    });

    it('throws DomainError with token revoked detail when firebase reports revocation', async () => {
      expect.assertions(1);

      const error = Object.assign(new Error('revoked'), { code: 'auth/id-token-revoked' });
      auth.verifyIdToken.mockRejectedValue(error);

      await expect(service.verifyIdToken('token')).rejects.toMatchObject({
        errorCode: 'DO0006',
        detail: 'Firebase token revoked.',
      });
    });

    it('throws DomainError with invalid token detail when firebase returns other error codes', async () => {
      expect.assertions(1);

      const error = Object.assign(new Error('other'), { code: 'auth/unknown-error' });
      auth.verifyIdToken.mockRejectedValue(error);

      await expect(service.verifyIdToken('token')).rejects.toMatchObject({
        errorCode: 'DO0007',
        detail: 'Firebase invalid token.',
      });
    });

    it('throws DomainError with invalid token detail when firebase throws a non-error value', async () => {
      expect.assertions(1);

      auth.verifyIdToken.mockRejectedValue('something unexpected');

      await expect(service.verifyIdToken('token')).rejects.toMatchObject({
        errorCode: 'DO0007',
        detail: 'Firebase invalid token.',
      });
    });
  });

  describe('getUser', () => {
    it('returns the firebase user when found', async () => {
      expect.assertions(3);

      const user = { uid: 'uid-456' };
      auth.getUser.mockResolvedValue(user);

      const result = await service.getUser('uid-456');

      expect(provider.auth).toHaveBeenCalledTimes(1);
      expect(auth.getUser).toHaveBeenCalledWith('uid-456');
      expect(result).toBe(user);
    });

    it('throws DomainError with not found detail when firebase cannot find the user', async () => {
      expect.assertions(1);

      auth.getUser.mockRejectedValue(new Error('not found'));

      await expect(service.getUser('uid-missing')).rejects.toMatchObject({
        errorCode: 'DO0008',
        detail: 'Firebase user not found.',
      });
    });
  });

  describe('deleteUser', () => {
    it('deletes the user when firebase succeeds', async () => {
      expect.assertions(2);

      auth.deleteUser.mockResolvedValue(undefined);

      await service.deleteUser('uid-789');

      expect(provider.auth).toHaveBeenCalledTimes(1);
      expect(auth.deleteUser).toHaveBeenCalledWith('uid-789');
    });

    it('treats already deleted users as success', async () => {
      expect.assertions(1);

      const error = Object.assign(new Error('missing'), { code: 'auth/user-not-found' });
      auth.deleteUser.mockRejectedValue(error);

      await expect(service.deleteUser('uid-missing')).resolves.toBeUndefined();
    });

    it('throws DomainError when firebase deletion fails for other reasons', async () => {
      expect.assertions(1);

      auth.deleteUser.mockRejectedValue(new Error('internal error'));

      await expect(service.deleteUser('uid-err')).rejects.toMatchObject({
        errorCode: 'DO0009',
        detail: 'Failed to delete Firebase user.',
      });
    });
  });
});
