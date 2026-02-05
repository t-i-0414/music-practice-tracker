import { useCallback, useState } from 'react';

import * as Updates from 'expo-updates';

const DEFAULT_PROGRESS = 0;

export type UseAppUpdatesReturn = {
  /** Whether expo-updates is enabled in this build */
  isEnabled: boolean;
  /** Whether app is running embedded code (not an update) */
  isEmbeddedLaunch: boolean;
  /** Whether a new update is available to download */
  isUpdateAvailable: boolean;
  /** Whether an update has been downloaded and is pending */
  isUpdatePending: boolean;
  /** Whether currently checking for updates */
  isChecking: boolean;
  /** Whether currently downloading an update */
  isDownloading: boolean;
  /** Download progress (0-1) */
  downloadProgress: number;
  /** Error from last update check */
  checkError: Error | null;
  /** Error from last download attempt */
  downloadError: Error | null;
  /** Manually check for updates */
  checkForUpdates(): Promise<boolean>;
  /** Download and apply the available update */
  downloadAndApplyUpdate(): Promise<void>;
};

export const useAppUpdates = (): UseAppUpdatesReturn => {
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    downloadProgress,
    checkError,
    downloadError,
  } = Updates.useUpdates();

  const [manualCheckError, setManualCheckError] = useState<Error | null>(null);
  const [manualDownloadError, setManualDownloadError] = useState<Error | null>(null);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!Updates.isEnabled) {
      return false;
    }

    setManualCheckError(null);

    try {
      const result = await Updates.checkForUpdateAsync();
      return result.isAvailable;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setManualCheckError(err);
      return false;
    }
  }, []);

  const downloadAndApplyUpdate = useCallback(async (): Promise<void> => {
    if (!Updates.isEnabled) {
      return;
    }

    setManualDownloadError(null);

    try {
      // If update is already downloaded and pending, just reload to apply it
      if (isUpdatePending) {
        await Updates.reloadAsync();
        return;
      }

      // Otherwise, fetch the update first
      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        await Updates.reloadAsync();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setManualDownloadError(err);
      throw err;
    }
  }, [isUpdatePending]);

  return {
    isEnabled: Updates.isEnabled,
    isEmbeddedLaunch: currentlyRunning.isEmbeddedLaunch,
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    downloadProgress: downloadProgress ?? DEFAULT_PROGRESS,
    checkError: checkError ?? manualCheckError,
    downloadError: downloadError ?? manualDownloadError,
    checkForUpdates,
    downloadAndApplyUpdate,
  };
};
