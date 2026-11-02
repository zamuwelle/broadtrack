#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' "$ENV_CONTENT" > frontend/web/.env
