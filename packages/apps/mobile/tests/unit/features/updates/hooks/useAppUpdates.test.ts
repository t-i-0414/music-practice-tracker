import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Updates from 'expo-updates';

import { useAppUpdates } from '@/features/updates/hooks/useAppUpdates';

// Variable to control isEnabled mock value
let mockIsEnabled = true;

// Mock expo-updates
jest.mock('expo-updates', () => ({
  get isEnabled() {
    return mockIsEnabled;
  },
  useUpdates: jest.fn(),
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

const mockUseUpdates = jest.mocked(Updates.useUpdates);
const mockCheckForUpdateAsync = jest.mocked(Updates.checkForUpdateAsync);
const mockFetchUpdateAsync = jest.mocked(Updates.fetchUpdateAsync);
const mockReloadAsync = jest.mocked(Updates.reloadAsync);

const createMockUseUpdatesReturn = (
  overrides: Partial<ReturnType<typeof Updates.useUpdates>> = {},
): ReturnType<typeof Updates.useUpdates> =>
  ({
    currentlyRunning: {
      isEmbeddedLaunch: true,
      updateId: undefined,
      channel: undefined,
      createdAt: new Date(),
      isEmergencyLaunch: false,
      emergencyLaunchReason: null,
      manifest: undefined,
      runtimeVersion: '1.0.0',
    },
    isUpdateAvailable: false,
    isUpdatePending: false,
    isChecking: false,
    isDownloading: false,
    downloadProgress: 0,
    checkError: null,
    downloadError: null,
    availableUpdate: null,
    downloadedUpdate: null,
    initializationError: null,
    lastCheckForUpdateTimeSinceRestart: null,
    ...overrides,
  }) as ReturnType<typeof Updates.useUpdates>;

describe('useAppUpdates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsEnabled = true;
    mockUseUpdates.mockReturnValue(createMockUseUpdatesReturn());
  });

  describe('initial state', () => {
    it('returns correct initial values when enabled', () => {
      expect.hasAssertions();

      const { result } = renderHook(() => useAppUpdates());

      expect(result.current.isEnabled).toBe(true);
      expect(result.current.isEmbeddedLaunch).toBe(true);
      expect(result.current.isUpdateAvailable).toBe(false);
      expect(result.current.isUpdatePending).toBe(false);
    });

    it('returns correct status values', () => {
      expect.hasAssertions();

      const { result } = renderHook(() => useAppUpdates());

      expect(result.current.isChecking).toBe(false);
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.downloadProgress).toBe(0);
      expect(result.current.checkError).toBeNull();
      expect(result.current.downloadError).toBeNull();
    });

    it('returns downloadProgress as 0 when undefined', () => {
      expect.hasAssertions();

      mockUseUpdates.mockReturnValue(
        createMockUseUpdatesReturn({
          downloadProgress: undefined,
        }),
      );

      const { result } = renderHook(() => useAppUpdates());

      expect(result.current.downloadProgress).toBe(0);
    });
  });

  describe('checkForUpdates', () => {
    it('returns false when updates are disabled', async () => {
      expect.hasAssertions();

      mockIsEnabled = false;

      const { result } = renderHook(() => useAppUpdates());

      let checkResult: boolean | undefined;
      await act(async () => {
        checkResult = await result.current.checkForUpdates();
      });

      expect(checkResult).toBe(false);
      expect(mockCheckForUpdateAsync).not.toHaveBeenCalled();
    });

    it('returns true when update is available', async () => {
      expect.hasAssertions();

      mockCheckForUpdateAsync.mockResolvedValue({
        isAvailable: true,
        isRollBackToEmbedded: false,
      } as unknown as Awaited<ReturnType<typeof Updates.checkForUpdateAsync>>);

      const { result } = renderHook(() => useAppUpdates());

      let checkResult: boolean | undefined;
      await act(async () => {
        checkResult = await result.current.checkForUpdates();
      });

      expect(checkResult).toBe(true);
      expect(mockCheckForUpdateAsync).toHaveBeenCalledTimes(1);
    });

    it('returns false when no update is available', async () => {
      expect.hasAssertions();

      mockCheckForUpdateAsync.mockResolvedValue({
        isAvailable: false,
        isRollBackToEmbedded: false,
      } as unknown as Awaited<ReturnType<typeof Updates.checkForUpdateAsync>>);

      const { result } = renderHook(() => useAppUpdates());

      let checkResult: boolean | undefined;
      await act(async () => {
        checkResult = await result.current.checkForUpdates();
      });

      expect(checkResult).toBe(false);
    });

    it('handles errors and returns false', async () => {
      expect.hasAssertions();

      mockCheckForUpdateAsync.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAppUpdates());

      let checkResult: boolean | undefined;
      await act(async () => {
        checkResult = await result.current.checkForUpdates();
      });

      expect(checkResult).toBe(false);

      await waitFor(() => {
        expect(result.current.checkError).toBeInstanceOf(Error);
      });
    });

    it('converts non-Error to Error', async () => {
      expect.hasAssertions();

      mockCheckForUpdateAsync.mockRejectedValue('string error');

      const { result } = renderHook(() => useAppUpdates());

      await act(async () => {
        await result.current.checkForUpdates();
      });

      await waitFor(() => {
        expect(result.current.checkError).toHaveProperty(
          'message',
          'string error',
        );
      });
    });
  });

  describe('downloadAndApplyUpdate', () => {
    it('does nothing when updates are disabled', async () => {
      expect.hasAssertions();

      mockIsEnabled = false;

      const { result } = renderHook(() => useAppUpdates());

      await act(async () => {
        await result.current.downloadAndApplyUpdate();
      });

      expect(mockFetchUpdateAsync).not.toHaveBeenCalled();
      expect(mockReloadAsync).not.toHaveBeenCalled();
    });

    it('calls reloadAsync directly when update is pending', async () => {
      expect.hasAssertions();

      mockUseUpdates.mockReturnValue(
        createMockUseUpdatesReturn({
          isUpdatePending: true,
        }),
      );
      mockReloadAsync.mockResolvedValue();

      const { result } = renderHook(() => useAppUpdates());

      await act(async () => {
        await result.current.downloadAndApplyUpdate();
      });

      expect(mockFetchUpdateAsync).not.toHaveBeenCalled();
      expect(mockReloadAsync).toHaveBeenCalledTimes(1);
    });

    it('fetches and reloads when new update is available', async () => {
      expect.hasAssertions();

      mockFetchUpdateAsync.mockResolvedValue({
        isNew: true,
        isRollBackToEmbedded: false,
        manifest: { id: 'test-manifest' },
      } as Awaited<ReturnType<typeof Updates.fetchUpdateAsync>>);
      mockReloadAsync.mockResolvedValue();

      const { result } = renderHook(() => useAppUpdates());

      await act(async () => {
        await result.current.downloadAndApplyUpdate();
      });

      expect(mockFetchUpdateAsync).toHaveBeenCalledTimes(1);
      expect(mockReloadAsync).toHaveBeenCalledTimes(1);
    });

    it('does not reload when fetched update is not new', async () => {
      expect.hasAssertions();

      mockFetchUpdateAsync.mockResolvedValue({
        isNew: false,
        isRollBackToEmbedded: false,
      } as Awaited<ReturnType<typeof Updates.fetchUpdateAsync>>);

      const { result } = renderHook(() => useAppUpdates());

      await act(async () => {
        await result.current.downloadAndApplyUpdate();
      });

      expect(mockFetchUpdateAsync).toHaveBeenCalledTimes(1);
      expect(mockReloadAsync).not.toHaveBeenCalled();
    });

    it('handles errors and re-throws', async () => {
      expect.hasAssertions();

      mockFetchUpdateAsync.mockRejectedValue(new Error('Download failed'));

      const { result } = renderHook(() => useAppUpdates());

      let thrownError: Error | undefined;
      await act(async () => {
        try {
          await result.current.downloadAndApplyUpdate();
        } catch (e) {
          thrownError = e as Error;
        }
      });

      expect(thrownError).toHaveProperty('message', 'Download failed');
    });
  });
});
