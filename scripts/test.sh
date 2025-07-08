#!/bin/bash
set -euo pipefail

CMD="test"
if [[ "${1:-}" == "--coverage" ]]; then
  CMD="test:cov"
fi

echo "🔍 Searching for packages with entry '$CMD' command and package.json..."

find packages -type f -name package.json |
  grep -v '/node_modules/' |
  grep -v '/.next/' |
  grep -v '/dist/' |
  grep -v '/build/' |
  grep -v '/generated/' |
  grep -v '/coverage/' |
  grep -v '/admin/' |
  while read -r package; do
    dir=$(dirname "$package")

    if grep -q "\"$CMD\":" "$package"; then
      echo "📦 Running 'bun run $CMD' in $dir"
      (cd "$dir" && bun run "$CMD")
    else
      echo "⚠️  Skipping $dir (no $CMD command in package.json)"
    fi
  done

echo "🔍 Checking if admin server is running on http://localhost:8000..."

if ! curl --silent --fail http://localhost:8000 >/dev/null; then
  echo "🚀 Admin server not detected. Starting with 'bun run start:dev' in background..."
  cd packages/apps/admin || {
    echo "❌ Failed to change directory to packages/apps/admin. Ensure the path is correct."
    exit 1
  }
  bun run start:dev &
  ADMIN_SERVER_PID=$!
  cd - || {
    echo "❌ Failed to change back to the original directory."
    kill "$ADMIN_SERVER_PID"
    exit 1
  }

  echo "⏳ Waiting for admin server to become available..."
  for _i in {1..30}; do
    if curl --silent --fail http://localhost:8000 >/dev/null; then
      echo "✅ Admin server is up!"
      break
    fi
    sleep 1
  done

  if ! curl --silent --fail http://localhost:8000 >/dev/null; then
    echo "❌ Admin server did not start within expected time."
    kill "$ADMIN_SERVER_PID"
    exit 1
  fi
else
  echo "✅ Admin server is already running."
fi

cd packages/apps/admin || {
  echo "❌ Failed to change directory to packages/apps/admin. Ensure the path is correct."
  exit 1
}
bun run "$CMD" || {
  echo "❌ 'bun run $CMD' failed in packages/apps/admin. Check the logs for details."
  kill "$ADMIN_SERVER_PID"
  exit 1
}
cd - || {
  echo "❌ Failed to change back to the original directory."
  exit 1
}

if [[ -n "${ADMIN_SERVER_PID:-}" ]]; then
  echo "🛑 Stopping admin server (PID: $ADMIN_SERVER_PID)"
  kill "$ADMIN_SERVER_PID"
fi

echo "✅ All tests complete."
