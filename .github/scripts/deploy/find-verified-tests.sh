#!/usr/bin/env bash
set -euo pipefail

for attempt in 1 2 3 4; do
    if bash .github/scripts/shared/verified-tests.sh "$GITHUB_SHA"; then
        echo 'verified=true' >> "$GITHUB_OUTPUT"
        break
    fi
    if [ "$GITHUB_EVENT_NAME" != 'push' ] || [ "$GITHUB_REF" != 'refs/heads/dev' ] || [ "$attempt" = 4 ]; then
        break
    fi
    sleep 3
done
