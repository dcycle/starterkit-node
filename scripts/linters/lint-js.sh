#!/bin/bash
#
# Lint files; make sure they follow style guidelines.
set -e



echo '=> Linting js with https://github.com/dcycle/docker-js-lint'
docker run --rm \
  -v "$(pwd)":/app/code \
  -v "$(pwd)/scripts":/scripts \
  dcycle/js-lint:3 -c /scripts/lib/config/json-lint/js-hint-config.json .
