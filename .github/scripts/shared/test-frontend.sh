#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)/frontend"
bun install --frozen-lockfile
bun run lint:frontend
bun run test:frontend
