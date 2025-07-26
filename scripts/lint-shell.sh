#!/bin/bash
set -eu

echo "🔍 Linting shell scripts..."

echo "📂 Checking root 'scripts/*.sh'"
if [ -d "scripts" ]; then
    file_count=$(find scripts -maxdepth 1 -name "*.sh" -type f 2>/dev/null | wc -l)

    if [ "$file_count" -gt 0 ]; then
        echo "   Found $file_count file(s)"
        find scripts -maxdepth 1 -name "*.sh" -type f -exec bunx shellcheck {} +
    else
        echo "   ⚠️  No files found - skipping"
    fi
else
    echo "   ⚠️  Directory 'scripts' not found - skipping"
fi

echo "📂 Checking packages 'scripts/*.sh'"
if [ -d "packages" ]; then
    file_count=$(find packages -path "*/scripts/*.sh" -type f 2>/dev/null | wc -l)

    if [ "$file_count" -gt 0 ]; then
        echo "   Found $file_count file(s)"
        find packages -path "*/scripts/*.sh" -type f -exec bunx shellcheck {} +
    else
        echo "   ⚠️  No files found - skipping"
    fi
else
    echo "   ⚠️  Directory 'packages' not found - skipping"
fi

echo "✅ All shell scripts passed linting!"
