#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)/frontend/web"
credentials=$(mktemp)
trap 'rm -f "$credentials"' EXIT
printf '%s\n' "$FIREBASE_SERVICE_ACCOUNT" > "$credentials"
GOOGLE_APPLICATION_CREDENTIALS="$credentials" firebase deploy --only hosting --project "$PROJECT_ID"
