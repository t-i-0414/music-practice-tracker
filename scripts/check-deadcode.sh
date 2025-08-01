#!/bin/bash
set -eu

CMD="lint:es:deadcode:check"
FAILED=0

echo "🔍 Checking for dead code......"
echo "📦 Running 'npx ts-prune -e' in root"
if ! npx ts-prune -e; then
    echo "❌ Failed in root"
    FAILED=1
fi

TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT

find packages -maxdepth 3 -type f -name package.json > "$TEMP_FILE"

while IFS= read -r config; do
    dir=$(dirname "$config")

    if grep -q "\"$CMD\":" "$config" 2>/dev/null; then
        echo "📦 Running 'bun run $CMD' in $dir"
        if ! (cd "$dir" && bun run "$CMD"); then
            echo "❌ Failed in $dir"
            FAILED=1
        fi
    else
        echo "⚠️  Skipped in $dir"
    fi
done < "$TEMP_FILE"

if [ $FAILED -eq 0 ]; then
    echo "✅ All dead code checks complete."
else
    echo "❌ Some checks failed."
    exit 1
fi
