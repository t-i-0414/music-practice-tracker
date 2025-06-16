#!/bin/bash
set -euo pipefail

echo "🔍 Running typesync..."
output=$(typesync)

echo "$output"

if echo "$output" | grep -q "No new typings to add"; then
  echo "✅ All typings are synced. Skipping bun install."
  exit 0
fi

echo "📦 New typings detected, running bun install..."
SKIP_POSTINSTALL=1 bun install
