import { fireEvent, render } from '@testing-library/react-native';

import { UpdateBanner } from '@/features/updates/components/UpdateBanner';
import { type UpdatesContextValue, useUpdatesContext } from '@/features/updates/context/UpdatesProvider';

// Mock the context hook
jest.mock('@/features/updates/context/UpdatesProvider', () => ({
  useUpdatesContext: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock the useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn().mockReturnValue('#000000'),
}));

const mockUseUpdatesContext = jest.mocked(useUpdatesContext);

const createMockContextValue = (overrides: Partial<UpdatesContextValue> = {}): UpdatesContextValue => ({
  isEnabled: true,
  isEmbeddedLaunch: true,
  isUpdateAvailable: true,
  isUpdatePending: false,
  isChecking: false,
  isDownloading: false,
  downloadProgress: 0,
  checkError: null,
  downloadError: null,
  checkForUpdates: jest.fn().mockResolvedValue(false),
  downloadAndApplyUpdate: jest.fn().mockResolvedValue(undefined),
  showBanner: true,
  hideBanner: jest.fn(),
  isDismissed: false,
  ...overrides,
});

describe('UpdateBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdatesContext.mockReturnValue(createMockContextValue());
  });

  describe('visibility', () => {
    it('renders null when showBanner is false', () => {
      expect.hasAssertions();

      mockUseUpdatesContext.mockReturnValue(
        createMockContextValue({
          showBanner: false,
        }),
      );

      const { toJSON } = render(<UpdateBanner />);

      expect(toJSON()).toBeNull();
    });

    it('renders banner when showBanner is true', () => {
      expect.hasAssertions();

      const { getByText } = render(<UpdateBanner />);

      expect(getByText('A new update is available')).toBeDefined();
    });
  });

  describe('message display', () => {
    it('shows available message when not downloading', () => {
      expect.hasAssertions();

      const { getByText } = render(<UpdateBanner />);

      expect(getByText('A new update is available')).toBeDefined();
    });

    it('shows downloading message with progress', () => {
      expect.hasAssertions();

      const downloadProgress = 0.5;
      mockUseUpdatesContext.mockReturnValue(
        createMockContextValue({
          isDownloading: true,
          downloadProgress,
        }),
      );

      const { getByText } = render(<UpdateBanner />);

      expect(getByText('Downloading update... 50%')).toBeDefined();
    });

    it('rounds progress percentage correctly', () => {
      expect.hasAssertions();

      const progressValues = [
        { input: 0.123, expected: '12%' },
        { input: 0.456, expected: '46%' },
        { input: 0.999, expected: '100%' },
        { input: 1, expected: '100%' },
      ];

      for (const { input, expected } of progressValues) {
        mockUseUpdatesContext.mockReturnValue(
          createMockContextValue({
            isDownloading: true,
            downloadProgress: input,
          }),
        );

        const { getByText } = render(<UpdateBanner />);
        expect(getByText(`Downloading update... ${expected}`)).toBeDefined();
      }
    });
  });

  describe('button interactions', () => {
    it('shows Update button when not downloading', () => {
      expect.hasAssertions();

      const { getByText } = render(<UpdateBanner />);

      expect(getByText('Update')).toBeDefined();
    });

    it('hides Update button when downloading', () => {
      expect.hasAssertions();

      mockUseUpdatesContext.mockReturnValue(
        createMockContextValue({
          isDownloading: true,
        }),
      );

      const { queryByText } = render(<UpdateBanner />);

      expect(queryByText('Update')).toBeNull();
    });

    it('calls downloadAndApplyUpdate when Update button is pressed', () => {
      expect.hasAssertions();

      const mockDownloadAndApplyUpdate = jest.fn().mockResolvedValue(undefined);
      mockUseUpdatesContext.mockReturnValue(
        createMockContextValue({
          downloadAndApplyUpdate: mockDownloadAndApplyUpdate,
        }),
      );

      const { getByText } = render(<UpdateBanner />);

      fireEvent.press(getByText('Update'));

      expect(mockDownloadAndApplyUpdate).toHaveBeenCalledTimes(1);
    });

    it('calls hideBanner when close button is pressed', () => {
      expect.hasAssertions();

      const mockHideBanner = jest.fn();
      mockUseUpdatesContext.mockReturnValue(
        createMockContextValue({
          hideBanner: mockHideBanner,
        }),
      );

      const { getByText } = render(<UpdateBanner />);

      fireEvent.press(getByText('✕'));

      expect(mockHideBanner).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has accessibility label on Update button', () => {
      expect.hasAssertions();

      const { getByLabelText } = render(<UpdateBanner />);

      expect(getByLabelText('Download and apply update')).toBeDefined();
    });

    it('has accessibility label on close button', () => {
      expect.hasAssertions();

      const { getByLabelText } = render(<UpdateBanner />);

      expect(getByLabelText('Dismiss update notification')).toBeDefined();
    });

    it('has correct accessibility role on buttons', () => {
      expect.hasAssertions();

      const { getByLabelText } = render(<UpdateBanner />);

      const updateButton = getByLabelText('Download and apply update');
      const closeButton = getByLabelText('Dismiss update notification');

      expect(updateButton.props.accessibilityRole).toBe('button');
      expect(closeButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('progress bar', () => {
    it('does not show progress bar when not downloading', () => {
      expect.hasAssertions();

      const { toJSON } = render(<UpdateBanner />);
      const json = JSON.stringify(toJSON());

      // Progress bar should not be in the output when not downloading
      // We check by looking for a specific width percentage pattern
      expect(json).not.toContain('"width":"50%"');
    });

    it('shows progress bar when downloading', () => {
      expect.hasAssertions();

      mockUseUpdatesContext.mockReturnValue(
        createMockContextValue({
          isDownloading: true,
          downloadProgress: 0.5,
        }),
      );

      const { toJSON } = render(<UpdateBanner />);
      const json = JSON.stringify(toJSON());

      // Progress bar fill should have width based on progress
      expect(json).toContain('"width":"50%"');
    });

    it('caps progress bar width at 100%', () => {
      expect.hasAssertions();

      mockUseUpdatesContext.mockReturnValue(
        createMockContextValue({
          isDownloading: true,
          downloadProgress: 1.5, // More than 100%
        }),
      );

      const { toJSON } = render(<UpdateBanner />);
      const json = JSON.stringify(toJSON());

      // Should be capped at 100%
      expect(json).toContain('"width":"100%"');
      expect(json).not.toContain('"width":"150%"');
    });
  });
});
