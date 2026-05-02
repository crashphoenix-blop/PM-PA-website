#!/usr/bin/env sh
set -e

if [ ! -d "node_modules" ]; then
  npm ci
fi

npm run build

PORT_VALUE="${PORT:-3000}"
exec npm run start -- --hostname 0.0.0.0 --port "${PORT_VALUE}"
