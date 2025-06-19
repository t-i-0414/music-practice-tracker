#!/bin/bash
set -euo pipefail

echo "🔍 Searching for tsconfig.json files in packages/ (excluding node_modules)..."

find packages \
  -type d -name node_modules -prune -o \
  -name tsconfig.json -print | while read -r config; do
  dir=$(dirname "$config")
  echo "📦 Type checking: $dir"
  tsc --noEmit -p "$dir"
done

echo "✅ All type checks complete."
