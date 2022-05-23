#!/bin/bash
#
# Lint files; make sure they follow style guidelines.
set -e

echo '=> Linting all file types'
./scripts/linters/lint-shell.sh
./scripts/linters/lint-yaml.sh
./scripts/linters/lint-js.sh
./scripts/linters/lint-json.sh
