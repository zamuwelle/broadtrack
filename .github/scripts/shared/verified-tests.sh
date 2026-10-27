#!/usr/bin/env bash
set -euo pipefail

commit=${1:?Commit SHA is required}
if [[ ! "$commit" =~ ^[0-9a-f]{40}$ ]]; then
    exit 1
fi

gh api "repos/$GH_REPO/commits/$commit/statuses?per_page=100" \
    --jq '([.[] | select(.context == "broadtrack/verified-tests")][0] // {}) | .state == "success" and .creator.login == "github-actions[bot]"' \
    | grep -qx true
