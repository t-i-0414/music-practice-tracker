import type React from 'react';
import { type ComponentProps } from 'react';

import { Platform } from 'react-native';

import { type Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export const ExternalLink: React.FC<Props> = ({ href, ...rest }) => (
  <Link
    target='_blank'
    {...rest}
    href={href}
    onPress={(event) => {
      if (Platform.OS !== 'web') {
        // Prevent the default behavior of linking to the default browser on native.
        event.preventDefault();
        // Open the link in an in-app browser.
        void (async (): Promise<void> => {
          await openBrowserAsync(href);
        })();
      }
    }}
  />
);
