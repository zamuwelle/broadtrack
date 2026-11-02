#!/usr/bin/env bash
set -euo pipefail
git -c "http.extraheader=AUTHORIZATION: basic $(printf 'x-access-token:%s' "$APP_TOKEN" | base64 | tr -d '\n')" fetch origin main
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
before=$(git rev-parse HEAD)
while IFS= read -r commit; do
    if git merge-base --is-ancestor "$commit" HEAD || git log --format=%B HEAD | grep -F "(cherry picked from commit $commit)" > /dev/null; then
        continue
    fi
    git cherry-pick -x "$commit"
done < <(git log origin/main --no-merges --reverse --format='%H' --author='dependabot\[bot\]')
if [ "$(git rev-parse HEAD)" != "$before" ]; then
    echo 'changed=true' >> "$GITHUB_OUTPUT"
    main_sha=$(git rev-parse origin/main)
    if [ "$(git rev-parse HEAD^{tree})" = "$(git rev-parse "$main_sha^{tree}")" ] && bash "$RUNNER_TEMP/verified-tests.sh" "$main_sha"; then
        echo 'verified=true' >> "$GITHUB_OUTPUT"
    fi
fi
