const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin that adds `use_modular_headers!` to the Podfile.
 *
 * Required because Firebase SDK (Swift) depends on pods that do not define
 * modules (e.g. GoogleUtilities, FirebaseAuthInterop, RecaptchaInterop).
 * Without this, CocoaPods fails with:
 *   "The Swift pod `FirebaseAuth` depends upon ... which do not define modules."
 */
const withFirebaseModularHeaders = (config) => {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let podfileContents = fs.readFileSync(podfilePath, 'utf8');

      if (!podfileContents.includes('use_modular_headers!')) {
        podfileContents = podfileContents.replace(
          /platform :ios/,
          'use_modular_headers!\nplatform :ios',
        );
        fs.writeFileSync(podfilePath, podfileContents);
      }

      return cfg;
    },
  ]);
};

module.exports = withFirebaseModularHeaders;
