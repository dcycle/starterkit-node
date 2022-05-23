#!/bin/bash
#
# Lint files; make sure they follow style guidelines.
set -e



echo '=> Linting js with https://github.com/dcycle/docker-js-lint'
docker run --rm -v "$(pwd)":/app/code dcycle/js-lint:2 -c /app/code/scripts/lib/config/json-lint/js-hint-config.json .


