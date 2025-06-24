#!/bin/bash
set -euo pipefail

echo "🔍 Searching for packages with eslint.config.ts and package.json..."

find packages -type f -name eslint.config.ts |
  grep -v '/node_modules/' |
  while read -r config; do
    dir=$(dirname "$config")

    if [[ -f "$dir/package.json" ]]; then
      echo "📦 Running 'bun run lint:check' in $dir"
      (cd "$dir" && bun run lint:check)
    else
      echo "⚠️  Skipping $dir (no package.json)"
    fi
  done

echo "✅ All lint checks complete."
