#!/bin/bash
set -euo pipefail

echo "🔍 Searching for tsconfig.json files in packages/..."

find packages -name tsconfig.json | while read -r config; do
  dir=$(dirname "$config")
  echo "📦 Type checking: $dir"
  tsc --noEmit -p "$dir"
done

echo "✅ All type checks complete."
