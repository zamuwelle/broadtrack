#!/usr/bin/env bash
set -euo pipefail

if git diff --quiet && git diff --cached --quiet; then
    echo "tree=$(git rev-parse HEAD^{tree})" >> "$GITHUB_OUTPUT"
else
    echo 'Tracked files changed during tests; the result cannot be reused.'
fi
