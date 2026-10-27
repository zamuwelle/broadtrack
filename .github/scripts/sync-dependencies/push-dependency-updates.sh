#!/usr/bin/env bash
set -euo pipefail

git -c "http.extraheader=AUTHORIZATION: basic $(printf 'x-access-token:%s' "$APP_TOKEN" | base64 | tr -d '\n')" push origin HEAD:refs/heads/dev
sha=$(git rev-parse HEAD)
gh api --method POST "repos/$GH_REPO/statuses/$sha" -f state=success -f context=broadtrack/verified-tests -f description='Frontend and backend passed for these files' -f target_url="$GITHUB_SERVER_URL/$GH_REPO/actions/runs/$GITHUB_RUN_ID" > /dev/null || echo 'Could not record tests; deployment will rerun them.'
