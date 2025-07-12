# @music-practice-tracker/tsconfig-base

Base TypeScript configuration for Music Practice Tracker projects.

## Usage

Extend this configuration in your project's `tsconfig.json`:

```json
{
  "extends": "@music-practice-tracker/tsconfig-base"
}
```

## Configuration

This base configuration provides:

- TypeScript 5.x recommended settings
- Strict type checking enabled
- ES2022 target for modern JavaScript features
- ESNext module system with bundler resolution
- Source maps and declaration files generation
- All strict compiler options enabled for maximum type safety

Projects extending this configuration should override settings as needed:

- `target` - Adjust based on your runtime environment
- `module` and `moduleResolution` - Change for specific frameworks
- Path aliases - Add project-specific aliases
- `lib` - Add DOM types or other libraries as needed
