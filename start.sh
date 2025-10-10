#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting container..."

# Ensure Node and pnpm are in PATH
export PATH="/usr/local/bin:$PATH"

echo "🔧 Checking tool versions..."
node -v || true
pnpm -v || true

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
  echo "📦 Installing dependencies with pnpm..."
  pnpm install --frozen-lockfile || pnpm install
else
  echo "⚠️ No package.json found — skipping pnpm install."
fi

# Build project
if grep -q "\"build\"" package.json 2>/dev/null; then
  echo "🏗️ Running build script..."
  pnpm run build
else
  echo "⚠️ No build script found in package.json."
fi


echo "✅ Build complete!"

