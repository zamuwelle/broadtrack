#!/usr/bin/env bash
set -euo pipefail

pr=$(gh pr list --state open --head "$HEAD_BRANCH" --json author,baseRefName,headRefOid --jq '.[] | select(.author.login == "app/dependabot" and .baseRefName == "main")')
if [ -n "$pr" ] && [ "$(echo "$pr" | jq -r .headRefOid)" = "$HEAD_SHA" ]; then
    echo 'valid=true' >> "$GITHUB_OUTPUT"
fi
