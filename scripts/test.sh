#!/bin/bash
set -euo pipefail

echo "🔍 Searching for packages with entry test command and package.json..."

find packages -type f -name package.json |
  grep -v '/node_modules/' |
  grep -v '/.next/' |
  grep -v '/dist/' |
  grep -v '/build/' |
  grep -v '/generated/' |
  while read -r package; do
    dir=$(dirname "$package")

    if grep -q '"test":' "$package"; then
      echo "📦 Running 'bun run test' in $dir"
      (cd "$dir" && bun run test)
    else
      echo "⚠️  Skipping $dir (no test command in package.json)"
    fi
  done

echo "✅ All tests complete."
