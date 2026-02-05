/* eslint-disable import/first, import/order */
import type React from 'react';

import { act, render, renderHook } from '@testing-library/react-native';
import { View } from 'react-native';

import type { UseAppUpdatesReturn } from '@/features/updates/hooks/useAppUpdates';

// Mock expo-updates to prevent import errors
jest.mock('expo-updates', () => ({
  isEnabled: true,
  useUpdates: jest.fn().mockReturnValue({
    currentlyRunning: { isEmbeddedLaunch: true },
    isUpdateAvailable: false,
    isUpdatePending: false,
    isChecking: false,
    isDownloading: false,
    downloadProgress: 0,
    checkError: null,
    downloadError: null,
  }),
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

// Store mock functions for useAppUpdates
let mockUseAppUpdatesReturn: UseAppUpdatesReturn;

jest.mock('@/features/updates/hooks/useAppUpdates', () => ({
  useAppUpdates: jest.fn(() => mockUseAppUpdatesReturn),
}));

// Import after mocking - order disabled for this file
import { UpdatesProvider, useUpdatesContext } from '@/features/updates/context/UpdatesProvider';
import { useAppUpdates } from '@/features/updates/hooks/useAppUpdates';
/* eslint-enable import/first, import/order */

const mockedUseAppUpdates = jest.mocked(useAppUpdates);

// Simple child component for rendering tests
const TestChild: React.FC = () => <View testID='test-child' />;

const createMockUseAppUpdatesReturn = (overrides: Partial<UseAppUpdatesReturn> = {}): UseAppUpdatesReturn => ({
  isEnabled: true,
  isEmbeddedLaunch: true,
  isUpdateAvailable: false,
  isUpdatePending: false,
  isChecking: false,
  isDownloading: false,
  downloadProgress: 0,
  checkError: null,
  downloadError: null,
  checkForUpdates: jest.fn().mockResolvedValue(false),
  downloadAndApplyUpdate: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const wrapper = ({ children }: { children: React.ReactNode }) => <UpdatesProvider>{children}</UpdatesProvider>;

describe('UpdatesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn();
    mockedUseAppUpdates.mockImplementation(() => mockUseAppUpdatesReturn);
  });

  describe('useUpdatesContext', () => {
    it('throws error when used outside provider', () => {
      expect.hasAssertions();

      expect(() => {
        renderHook(() => useUpdatesContext());
      }).toThrow('useUpdatesContext must be used within an UpdatesProvider');
    });

    it('returns context value when used within provider', () => {
      expect.hasAssertions();

      const { result } = renderHook(() => useUpdatesContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.showBanner).toBe(false);
      expect(result.current.isDismissed).toBe(false);
    });
  });

  describe('auto-check behavior', () => {
    it('checks for updates on mount when autoCheck is true (default)', () => {
      expect.hasAssertions();

      const mockCheckForUpdates = jest.fn().mockResolvedValue(false);
      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        checkForUpdates: mockCheckForUpdates,
      });

      render(
        <UpdatesProvider>
          <TestChild />
        </UpdatesProvider>,
      );

      expect(mockCheckForUpdates).toHaveBeenCalledTimes(1);
    });

    it('does not check for updates when autoCheck is false', () => {
      expect.hasAssertions();

      const mockCheckForUpdates = jest.fn().mockResolvedValue(false);
      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        checkForUpdates: mockCheckForUpdates,
      });

      render(
        <UpdatesProvider autoCheck={false}>
          <TestChild />
        </UpdatesProvider>,
      );

      expect(mockCheckForUpdates).not.toHaveBeenCalled();
    });

    it('does not check for updates when updates are disabled', () => {
      expect.hasAssertions();

      const mockCheckForUpdates = jest.fn().mockResolvedValue(false);
      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isEnabled: false,
        checkForUpdates: mockCheckForUpdates,
      });

      render(
        <UpdatesProvider>
          <TestChild />
        </UpdatesProvider>,
      );

      expect(mockCheckForUpdates).not.toHaveBeenCalled();
    });
  });

  describe('auto-apply behavior', () => {
    it('applies pending update when isUpdatePending is true', () => {
      expect.hasAssertions();

      const mockDownloadAndApplyUpdate = jest.fn().mockResolvedValue(undefined);
      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isUpdatePending: true,
        downloadAndApplyUpdate: mockDownloadAndApplyUpdate,
      });

      render(
        <UpdatesProvider>
          <TestChild />
        </UpdatesProvider>,
      );

      expect(mockDownloadAndApplyUpdate).toHaveBeenCalledTimes(1);
    });

    it('does not apply when updates are disabled', () => {
      expect.hasAssertions();

      const mockDownloadAndApplyUpdate = jest.fn().mockResolvedValue(undefined);
      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isEnabled: false,
        isUpdatePending: true,
        downloadAndApplyUpdate: mockDownloadAndApplyUpdate,
      });

      render(
        <UpdatesProvider>
          <TestChild />
        </UpdatesProvider>,
      );

      expect(mockDownloadAndApplyUpdate).not.toHaveBeenCalled();
    });

    it('handles download error gracefully', () => {
      expect.hasAssertions();

      const mockDownloadAndApplyUpdate = jest.fn().mockRejectedValue(new Error('Download failed'));
      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isUpdatePending: true,
        downloadAndApplyUpdate: mockDownloadAndApplyUpdate,
      });

      // Should not throw
      expect(() =>
        render(
          <UpdatesProvider>
            <TestChild />
          </UpdatesProvider>,
        ),
      ).not.toThrow();

      expect(mockDownloadAndApplyUpdate).toHaveBeenCalled();
    });
  });

  describe('banner visibility', () => {
    it('shows banner when update is available and not dismissed', () => {
      expect.hasAssertions();

      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isUpdateAvailable: true,
      });

      const { result } = renderHook(() => useUpdatesContext(), { wrapper });

      expect(result.current.showBanner).toBe(true);
    });

    it('hides banner when update is pending', () => {
      expect.hasAssertions();

      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isUpdateAvailable: true,
        isUpdatePending: true,
      });

      const { result } = renderHook(() => useUpdatesContext(), { wrapper });

      expect(result.current.showBanner).toBe(false);
    });

    it('hides banner when dismissed', () => {
      expect.hasAssertions();

      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isUpdateAvailable: true,
      });

      const { result } = renderHook(() => useUpdatesContext(), { wrapper });

      expect(result.current.showBanner).toBe(true);

      act(() => {
        result.current.hideBanner();
      });

      expect(result.current.showBanner).toBe(false);
      expect(result.current.isDismissed).toBe(true);
    });

    it('resets dismissed state when new update becomes available', () => {
      expect.hasAssertions();

      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isUpdateAvailable: false,
      });

      const { result, rerender } = renderHook(() => useUpdatesContext(), { wrapper });

      // Dismiss the banner (even though there's no update)
      act(() => {
        result.current.hideBanner();
      });

      expect(result.current.isDismissed).toBe(true);

      // Simulate new update becoming available
      mockUseAppUpdatesReturn = createMockUseAppUpdatesReturn({
        isUpdateAvailable: true,
      });

      rerender({});

      // isDismissed should be reset to false
      expect(result.current.isDismissed).toBe(false);
      expect(result.current.showBanner).toBe(true);
    });
  });
});
