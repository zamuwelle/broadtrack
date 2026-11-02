#!/usr/bin/env bash
set -euo pipefail

pr=$(gh pr list --state open --head "$HEAD_BRANCH" --json number,author,headRefOid,baseRefName --jq '.[] | select(.author.login == "app/dependabot" and (.baseRefName == "main" or .baseRefName == "dev"))')
if [ -z "$pr" ]; then
    echo 'No matching Dependabot pull request is open.'
    exit 0
fi
number=$(echo "$pr" | jq -r .number)
branch=$(echo "$pr" | jq -r .baseRefName)
if [ "$(echo "$pr" | jq -r .headRefOid)" != "$HEAD_SHA" ]; then
    echo 'The pull request changed since CI ran.'
    exit 0
fi
deploy=$(gh pr view "$number" --json files --jq '[.files[].path | select(. == "frontend/package.json" or . == "frontend/bun.lock" or startswith("frontend/web/") or startswith("frontend/shared/"))] | length')
files=$(gh pr view "$number" --json files --jq '[.files[].path]')
evidence_dir="$RUNNER_TEMP/tested-tree-$TEST_RUN_ID"
tested_tree=''
if echo "$files" | jq -e 'length > 0 and all(.[]; . == "backend/composer.json" or . == "backend/composer.lock" or . == "frontend/package.json" or . == "frontend/bun.lock" or . == "frontend/web/package.json")' > /dev/null && gh run download "$TEST_RUN_ID" --name tested-tree --dir "$evidence_dir"; then
    if [ -f "$evidence_dir/tested-tree" ]; then
        tested_tree=$(cat "$evidence_dir/tested-tree")
    fi
fi
if ! gh pr merge "$number" --squash --match-head-commit "$HEAD_SHA" --delete-branch; then
    if [ "$(gh pr view "$number" --json state --jq .state)" != 'MERGED' ]; then
        exit 1
    fi
    echo 'Merged, but branch deletion failed.'
fi
merged_sha=$(gh pr view "$number" --json mergeCommit --jq '.mergeCommit.oid')
if [[ "$tested_tree" =~ ^[0-9a-f]{40}$ ]] && [ "$(gh api "repos/$GH_REPO/git/commits/$merged_sha" --jq .tree.sha)" = "$tested_tree" ]; then
    gh api --method POST "repos/$GH_REPO/statuses/$merged_sha" -f state=success -f context=broadtrack/verified-tests -f description='Frontend and backend passed for these files' -f target_url="https://github.com/$GH_REPO/actions/runs/$TEST_RUN_ID" > /dev/null || echo 'Could not record tests; deployment will rerun them.'
fi
if [ "$deploy" -gt 0 ]; then
    gh workflow run deploy.yml --ref "$branch"
fi
if [ "$branch" = 'main' ]; then
    gh workflow run sync-dependencies.yml --ref main
fi
