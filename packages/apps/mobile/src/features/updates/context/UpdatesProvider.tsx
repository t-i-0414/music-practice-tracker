import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { type UseAppUpdatesReturn, useAppUpdates } from '../hooks/useAppUpdates';

export type UpdatesContextValue = UseAppUpdatesReturn & {
  /** Whether to show the update banner */
  showBanner: boolean;
  /** Hide the update banner */
  hideBanner(): void;
  /** Whether the banner was dismissed by user */
  isDismissed: boolean;
};

const UpdatesContext = createContext<UpdatesContextValue | null>(null);

type UpdatesProviderProps = {
  children: React.ReactNode;
  /** Whether to automatically check for updates on mount (default: true) */
  autoCheck?: boolean;
};

export const UpdatesProvider: React.FC<UpdatesProviderProps> = ({ children, autoCheck = true }) => {
  const updates = useAppUpdates();
  const [isDismissed, setIsDismissed] = useState(false);

  const { isEnabled, isUpdatePending, isUpdateAvailable, checkForUpdates, downloadAndApplyUpdate } = updates;

  // Auto-check for updates on mount
  useEffect(() => {
    if (autoCheck && isEnabled) {
      void checkForUpdates();
    }
  }, [autoCheck, isEnabled, checkForUpdates]);

  // Auto-apply pending updates
  useEffect(() => {
    if (isUpdatePending && isEnabled) {
      downloadAndApplyUpdate().catch(() => {
        // Error is already captured in the hook
      });
    }
  }, [isUpdatePending, isEnabled, downloadAndApplyUpdate]);

  const hideBanner = useCallback(() => {
    setIsDismissed(true);
  }, []);

  // Reset dismissed state when a new update becomes available
  useEffect(() => {
    if (isUpdateAvailable) {
      setIsDismissed(false);
    }
  }, [isUpdateAvailable]);

  const showBanner = isUpdateAvailable && !isDismissed && !isUpdatePending;

  const value = useMemo<UpdatesContextValue>(
    () => ({
      ...updates,
      showBanner,
      hideBanner,
      isDismissed,
    }),
    [updates, showBanner, hideBanner, isDismissed],
  );

  return <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>;
};

export const useUpdatesContext = (): UpdatesContextValue => {
  const context = useContext(UpdatesContext);

  if (!context) {
    throw new Error('useUpdatesContext must be used within an UpdatesProvider');
  }

  return context;
};
