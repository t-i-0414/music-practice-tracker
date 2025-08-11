#!/bin/bash
set -eu

# Determine command based on argument
CMD="lint:es:${1:-check}"
if [[ "$CMD" != "lint:es:check" && "$CMD" != "lint:es:fix" ]]; then
  echo "Usage: $0 [check|fix]"
  exit 1
fi

echo "🔍 Running ESLint ($CMD)..."

# Debug info for CI
if [[ "${CI:-false}" = "true" ]]; then
  echo "Running in CI environment"
  echo "Current directory: $(pwd)"
fi

# Use temp file for cross-platform compatibility
TEMP_FILE=$(mktemp)
FAIL_FILE=$(mktemp)
trap 'rm -f $TEMP_FILE $FAIL_FILE' EXIT

# Find all package.json files
find packages -name package.json -not -path "*/node_modules/*" 2>/dev/null > "$TEMP_FILE"

# Process packages
processed=0
found=0

while IFS= read -r package_json; do
  dir=$(dirname "$package_json")

  # Check if package has the lint command
  if grep -q "\"$CMD\"" "$package_json" 2>/dev/null; then
    found=$((found + 1))

    echo "📦 $dir"
    if (cd "$dir" && bun run "$CMD"); then
      processed=$((processed + 1))
    else
      echo "❌ Failed: $dir"
      echo "1" > "$FAIL_FILE"
    fi
  fi
done < "$TEMP_FILE"

# Report results
if [[ $found -eq 0 ]]; then
  echo "❌ No packages with $CMD found"
  exit 1
fi

echo "✅ Processed $processed of $found packages"

# Exit with error if any package failed
if [[ -s "$FAIL_FILE" ]]; then
  exit 1
fi
