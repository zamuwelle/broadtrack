#!/usr/bin/env bash
set -euo pipefail

mkdir -p ~/.cache/firebase-bin
curl -sL --fail https://firebase.tools/bin/linux/v15.33.0 -o ~/.cache/firebase-bin/firebase
chmod +x ~/.cache/firebase-bin/firebase
