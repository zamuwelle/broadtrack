#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
import json
import pathlib
import re
import os

path = pathlib.Path('package.json')
text = path.read_text()
catalog = json.loads(text)['catalog']
version = catalog['vite-plus']
alias = catalog['vite']
prefix = 'npm:@voidzero-dev/vite-plus-core@'
if not re.fullmatch(r'\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?', version) or not alias.startswith(prefix):
    raise SystemExit('Unexpected Vite Plus catalog entries')
if alias == prefix + version:
    raise SystemExit(0)
old = '"vite": "' + alias + '"'
if text.count(old) != 1:
    raise SystemExit('Unable to locate the Vite alias exactly once')
path.write_text(text.replace(old, '"vite": "' + prefix + version + '"'))
with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
    output.write('changed=true\n')
PY
if [ "$(git status --porcelain -- package.json)" != "" ]; then
    bun install --lockfile-only --ignore-scripts
fi
