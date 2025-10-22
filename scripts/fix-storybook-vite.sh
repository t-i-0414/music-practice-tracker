#!/bin/sh

# Fix for Storybook Vite import resolution issue with bun
# This creates a symlink to resolve the missing config/preview.mjs path

STORYBOOK_VITE_DIR="node_modules/.bun/@storybook+nextjs-vite@9.1.12+6d8ca9afa26b64d0/node_modules/@storybook/nextjs-vite/dist"

if [ -d "$STORYBOOK_VITE_DIR" ]; then
  echo "Fixing Storybook Vite module resolution..."
  mkdir -p "$STORYBOOK_VITE_DIR/config"
  ln -sf ../preview.mjs "$STORYBOOK_VITE_DIR/config/preview.mjs"
  echo "✅ Storybook Vite fix applied"
else
  echo "⚠️ Storybook Vite directory not found, skipping fix"
fi
