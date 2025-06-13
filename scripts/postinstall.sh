#!/bin/bash
set -e

if [ "$SKIP_POSTINSTALL" = "1" ]; then
  echo "⚠️  SKIP_POSTINSTALL=1 → Skipping postinstall"
  exit 0
fi

INSTALL_LOG=$(SKIP_POSTINSTALL=1 bun install 2>&1)
if echo "$INSTALL_LOG" | grep -q "(no changes)"; then
  echo "✅ bun install had no changes — skipping type:sync"
else
  echo "▶ Running bun run type:sync"
  bun run type:sync
fi
