#!/usr/bin/env bash
set -euo pipefail

node --check app.js
test -s index.html
test -s styles.css
test -s README.md
test -s LICENSE
test -s render.yaml
test -s docs/ARCHITECTURE.md
test -s docs/DEMO_SCRIPT.md
test -s docs/DEVPOST_SUBMISSION.md
test -s docs/SUBMISSION_CHECKLIST.md
printf 'Wayfinder submission checks passed.\n'
