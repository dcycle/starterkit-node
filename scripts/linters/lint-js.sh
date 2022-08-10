#!/bin/bash
#
# Lint files; make sure they follow style guidelines.
set -e

echo '=> Linting js with https://github.com/dcycle/docker-js-lint'
echo '=>'
echo '=> You can ignore false negatives like this:'
echo '=>'
echo '=> // https://github.com/jshint/jshint/issues/3070'
echo '=> /* jshint ignore:start */'
echo '=> expect(result).to.be.true;'
echo '=> /* jshint ignore:end */'
echo '=>'
docker run --rm \
  -v "$(pwd)":/app/code \
  -v "$(pwd)/scripts":/scripts \
  dcycle/js-lint:3 -c /scripts/lib/config/json-lint/js-hint-config.json .
