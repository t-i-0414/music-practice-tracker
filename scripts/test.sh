#!/bin/bash
set -euo pipefail

CMD="test"
if [[ "${1:-}" == "--coverage" ]]; then
  CMD="test:cov"
fi

echo "🔍 Searching for packages with entry test command and package.json..."

find packages -type f -name package.json |
  grep -v '/node_modules/' |
  grep -v '/.next/' |
  grep -v '/dist/' |
  grep -v '/build/' |
  grep -v '/generated/' |
  while read -r package; do
    dir=$(dirname "$package")

    if grep -q "\"$CMD\":" "$package"; then
      echo "📦 Running 'bun run $CMD' in $dir"
      (cd "$dir" && bun run "$CMD")
    else
      echo "⚠️  Skipping $dir (no $CMD command in package.json)"
    fi
  done

echo "✅ All tests complete."
