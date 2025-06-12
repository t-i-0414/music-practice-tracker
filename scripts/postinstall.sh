#!/bin/bash

if [ "$SKIP_POSTINSTALL" = "1" ]; then
  echo "⚠️  SKIP_POSTINSTALL=1 → Skipping postinstall"
  exit 0
fi

echo "▶ Running bun run type:sync"
bun run type:sync
