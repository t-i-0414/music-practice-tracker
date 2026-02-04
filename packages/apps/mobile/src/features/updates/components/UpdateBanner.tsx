import type React from 'react';

import { type DimensionValue, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUpdatesContext } from '../context/UpdatesProvider';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';


const BANNER_HEIGHT = 48;
const PROGRESS_BAR_HEIGHT = 3;
const BORDER_RADIUS = 8;
const PADDING_HORIZONTAL = 16;
const PADDING_VERTICAL = 12;
const BUTTON_PADDING_HORIZONTAL = 12;
const BUTTON_PADDING_VERTICAL = 6;
const BUTTON_BORDER_RADIUS = 4;
const CLOSE_BUTTON_SIZE = 24;
const FONT_SIZE_SMALL = 12;
const FONT_SIZE_MEDIUM = 14;
const FULL_PROGRESS = 1;
const PERCENT_MULTIPLIER = 100;
const Z_INDEX = 1000;

export const UpdateBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { showBanner, isDownloading, downloadProgress, hideBanner, downloadAndApplyUpdate } = useUpdatesContext();

  const backgroundColor = useThemeColor({}, 'primaryContainer');
  const textColor = useThemeColor({}, 'onPrimaryContainer');
  const buttonBackgroundColor = useThemeColor({}, 'primary');
  const buttonTextColor = useThemeColor({}, 'onPrimary');
  const progressBarBackground = useThemeColor({}, 'outline');
  const progressBarFill = useThemeColor({}, 'primary');

  if (!showBanner) {
    return null;
  }

  const handleUpdate = (): void => {
    void downloadAndApplyUpdate();
  };

  const progressPercent = Math.round(downloadProgress * PERCENT_MULTIPLIER);
  const progressWidthPercent = Math.min(downloadProgress, FULL_PROGRESS) * PERCENT_MULTIPLIER;
  const progressWidth: DimensionValue = `${progressWidthPercent}%`;

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <ThemedText style={[styles.message, { color: textColor }]}>
          {isDownloading ? `Downloading update... ${progressPercent}%` : 'A new update is available'}
        </ThemedText>

        <View style={styles.actions}>
          {isDownloading ? null : (
            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: buttonBackgroundColor }]}
              onPress={handleUpdate}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.updateButtonText, { color: buttonTextColor }]}>Update</ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={hideBanner} activeOpacity={0.7}>
            <ThemedText style={[styles.closeButtonText, { color: textColor }]}>✕</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {isDownloading ? (
        <View style={[styles.progressBar, { backgroundColor: progressBarBackground }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: progressBarFill,
                width: progressWidth,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: BORDER_RADIUS,
  },
  closeButton: {
    alignItems: 'center',
    height: CLOSE_BUTTON_SIZE,
    justifyContent: 'center',
    width: CLOSE_BUTTON_SIZE,
  },
  closeButtonText: {
    fontSize: FONT_SIZE_MEDIUM,
    fontWeight: '600',
  },
  container: {
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
    left: 0,
    minHeight: BANNER_HEIGHT,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: Z_INDEX,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: PADDING_VERTICAL,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZE_MEDIUM,
    fontWeight: '500',
  },
  progressBar: {
    height: PROGRESS_BAR_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  updateButton: {
    borderRadius: BUTTON_BORDER_RADIUS,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    paddingVertical: BUTTON_PADDING_VERTICAL,
  },
  updateButtonText: {
    fontSize: FONT_SIZE_SMALL,
    fontWeight: '600',
  },
});
