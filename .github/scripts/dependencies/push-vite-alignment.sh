#!/usr/bin/env bash
set -euo pipefail

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add frontend/package.json frontend/bun.lock
git commit -m 'fix: align Vite Plus dependencies [dependabot skip]'
git push origin "HEAD:refs/heads/$HEAD_BRANCH"
